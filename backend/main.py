from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError
import firebase_admin
from firebase_admin import credentials, firestore, auth, messaging
from dotenv import load_dotenv
import os
from typing import List, Dict, Optional
import uuid
import datetime

load_dotenv()
cred = credentials.Certificate(os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH'))
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="Delivery Website API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from React build
app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

# Serve favicon
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("frontend/dist/favicon.ico")

# Serve index.html for all other routes (SPA support)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Skip API routes
    if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse("frontend/dist/index.html")

security = HTTPBearer()
JWT_SECRET = os.getenv('JWT_SECRET')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    email: str
    password: str
    role: str = 'client'

class Parcel(BaseModel):
    id: str = str(uuid.uuid4())
    tracking_id: str
    status: str
    location: Dict[str, float]
    estimated_delivery: datetime.datetime
    sender: str
    receiver: str
    updates: List[Dict] = []

class PushRequest(BaseModel):
    uid: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    url: Optional[str] = None

# Auth Endpoints
@app.post("/register")
async def register(user: User):
    try:
        # Create Firebase Auth user
        firebase_user = auth.create_user(email=user.email, password=user.password)
        hashed_password = pwd_context.hash(user.password)
        user_dict = user.dict()
        user_dict['password'] = hashed_password
        # Store user in Firestore with UID as document ID
        db.collection('users').document(firebase_user.uid).set(user_dict)
        return {"message": "User registered", "uid": firebase_user.uid}
    except Exception as e:
        raise HTTPException(400, f"Registration failed: {str(e)}")

@app.post("/login")
async def login(user: User):
    try:
        # Verify with Firebase Auth
        firebase_user = auth.get_user_by_email(user.email)
        # Check password in Firestore
        doc = db.collection('users').document(firebase_user.uid).get()
        if doc.exists and pwd_context.verify(user.password, doc.to_dict()['password']):
            token = jwt.encode({"uid": firebase_user.uid, "email": user.email, "role": doc.to_dict()['role']}, JWT_SECRET, algorithm="HS256")
            return {"token": token}
        raise HTTPException(401, "Invalid credentials")
    except Exception as e:
        raise HTTPException(401, f"Login failed: {str(e)}")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload  # Contains 'uid', 'email', 'role'
    except InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# Parcel Endpoints
@app.post("/parcels")
async def create_parcel(parcel: Parcel, user: Dict = Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(403, "Admin only")
    db.collection('parcels').document(parcel.id).set(parcel.dict())
    return parcel

@app.get("/parcels")
async def get_all_parcels(user: Dict = Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(403, "Admin only")
    docs = db.collection('parcels').stream()
    return [doc.to_dict() for doc in docs]

@app.get("/parcels/{tracking_id}")
async def get_parcel(tracking_id: str, user: Dict = Depends(get_current_user)):
    docs = db.collection('parcels').where('tracking_id', '==', tracking_id).stream()
    for doc in docs:
        return doc.to_dict()
    raise HTTPException(404, "Parcel not found")

@app.put("/parcels/{parcel_id}")
async def update_parcel(parcel_id: str, update: Dict, user: Dict = Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(403, "Admin only")
    doc_ref = db.collection('parcels').document(parcel_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(404, "Parcel not found")
    doc_ref.update(update)
    updated = doc_ref.get().to_dict()
    for conn in active_connections:  # Broadcast update
        await conn.send_json(updated)
    return updated

# Push notifications - admin-only test endpoint
@app.post("/push/test")
async def push_test(req: PushRequest, user: Dict = Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(403, "Admin only")

    tokens: List[str] = []
    if req.uid:
        doc_ref = db.collection('users').document(req.uid)
        doc = doc_ref.get()
        if doc.exists:
            tokens = list({t for t in doc.to_dict().get('fcm_tokens', []) if t})
    else:
        users = db.collection('users').stream()
        for d in users:
            arr = d.to_dict().get('fcm_tokens', [])
            for t in arr:
                if t:
                    tokens.append(t)
        tokens = list(set(tokens))

    if not tokens:
        return {"sent": 0, "tokens": 0}

    def chunk(lst, n=500):
        for i in range(0, len(lst), n):
            yield lst[i:i+n]

    sent_total = 0
    for batch in chunk(tokens, 500):
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=req.title or "Rush Delivery",
                body=req.body or "This is a test notification."
            ),
            data={"url": req.url or "/notifications"},
            tokens=batch
        )
        resp = messaging.send_multicast(message)
        sent_total += resp.success_count

    return {"sent": sent_total, "tokens": len(tokens)}

# WebSocket for real-time
active_connections: List[WebSocket] = []

@app.websocket("/ws/{tracking_id}")
async def websocket_endpoint(websocket: WebSocket, tracking_id: str):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming if needed
    except WebSocketDisconnect:
        active_connections.remove(websocket)
