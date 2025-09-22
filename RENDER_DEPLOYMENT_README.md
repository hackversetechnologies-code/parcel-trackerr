# Render Deployment Guide for Delivery Website

This guide will help you deploy both the frontend and backend of your delivery website to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **Firebase Project**: Make sure your Firebase project is set up
3. **Service Account Key**: Download your Firebase service account JSON file

## Deployment Steps

### 1. Prepare Your Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration (Frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=path_to_your_service_account_json
JWT_SECRET=your_jwt_secret_key
```

### 2. Upload Service Account Key

1. Place your Firebase service account JSON file in the `backend/` directory
2. Update the `FIREBASE_SERVICE_ACCOUNT_PATH` in your `.env` file to point to this file

### 3. Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Blueprint**:
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the branch with your code

3. **Configure Services**:
   - **Frontend Service**:
     - Name: `delivery-frontend`
     - Runtime: `Static Site`
     - Build Command: `cd frontend && npm install && npm run build`
     - Publish Directory: `frontend/dist`

   - **Backend Service**:
     - Name: `delivery-backend`
     - Runtime: `Python 3`
     - Build Command: `pip install -r backend/requirements.txt`
     - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**:
   - Add all variables from your `.env` file
   - For `JWT_SECRET`, let Render generate it automatically
   - For Firebase credentials, use your actual values

#### Option B: Using render.yaml (Already Configured)

The `render.yaml` file is already configured in your project. When you connect your repository:

1. Render will automatically detect the `render.yaml` file
2. It will create two services: `delivery-frontend` and `delivery-backend`
3. Set your environment variables in the Render dashboard

### 4. Configure CORS (Important)

In production, update the CORS configuration in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-service.onrender.com",
        "https://your-custom-domain.com"  # if using custom domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. Update API Base URL

After deployment, update your frontend to use the correct API URL:

1. In Render dashboard, find your backend service URL (e.g., `https://delivery-backend.onrender.com`)
2. Update the API calls in your frontend to use this URL
3. Or use environment variables to configure the API URL

### 6. Database Configuration

Ensure your Firebase configuration works in the Render environment:

1. Make sure your Firebase project allows requests from Render's IP addresses
2. Verify your service account has the necessary permissions
3. Test the connection after deployment

## Post-Deployment Checklist

- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] Frontend can communicate with backend
- [ ] Firebase authentication works
- [ ] Database connections are functional
- [ ] WebSocket connections work (if using real-time features)
- [ ] Static assets load correctly
- [ ] Environment variables are properly set

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt` and `package.json`

2. **Environment Variables**:
   - Verify all required variables are set
   - Check for typos in variable names

3. **CORS Errors**:
   - Update CORS origins in `backend/main.py`
   - Check browser console for specific errors

4. **Firebase Connection Issues**:
   - Verify service account file path
   - Check Firebase project permissions
   - Ensure Firebase project is active

### Getting Help:

- Check Render logs in the dashboard
- Review Firebase console for errors
- Test API endpoints directly using tools like Postman

## Custom Domain (Optional)

To use a custom domain:

1. Add your domain in Render dashboard
2. Update DNS records as instructed
3. Update CORS origins to include your custom domain
4. Update Firebase authorized domains if using authentication

## Monitoring and Maintenance

- Monitor your services in Render dashboard
- Set up alerts for downtime or errors
- Regularly update dependencies for security
- Test critical functionality after updates

## Support

For Render-specific issues, check:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status Page](https://status.render.com)
