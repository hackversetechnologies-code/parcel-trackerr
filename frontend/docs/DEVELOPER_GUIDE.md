# Rush Delivery - Developer Guide

## Tech Stack
- Frontend: React 19, Vite 7, Tailwind CSS v4, React Router, React Query, Leaflet, Lottie, Sonner for toasts.
- Backend: FastAPI, Firebase Admin SDK, JWT auth.
- PWA: vite-plugin-pwa with Workbox.

## Project Structure
```
frontend/
  src/
    pages/               // Route components
    components/          // Reusable UI & layout (Navbar, Footer, InstallPrompt)
    components/ui/       // UI primitives (button, input, card, etc.)
    assets/              // Images, Lottie JSON
    firebase.js          // Firebase app, Auth, Firestore
    lib/utils.js         // cn utility
    index.css            // Tailwind layers & theme tokens
    App.jsx              // Router, QueryClient, Toaster, InstallPrompt
    main.jsx             // App bootstrap
  vite.config.js         // React, PWA, alias '@' -> src
  tailwind.config.js     // Theme, brand colors
backend/
  main.py                // FastAPI endpoints & WebSocket stub
```

## Environments
- Backend .env:
  - FIREBASE_SERVICE_ACCOUNT_PATH: path to service account JSON
  - JWT_SECRET: secret for signing JWT tokens

## Authentication Flow
1. User registers/logs in using Firebase Auth on the frontend.
2. Backend /register stores hashed password and role in Firestore; /login returns JWT containing uid/email/role.
3. Frontend stores JWT in localStorage and attaches as Authorization: Bearer {token}.
4. ProtectedRoute reads and decodes JWT to guard admin routes.

## API Endpoints
- POST /register: create user in Firebase & Firestore
- POST /login: verify credentials and return JWT
- POST /parcels: admin-only, create parcel
- GET /parcels: admin-only, list parcels
- GET /parcels/{tracking_id}: authenticated, fetch parcel by tracking_id
- PUT /parcels/{parcel_id}: admin-only, update parcel fields

## Tracking Page
- Reads trackingId from URL params and fetches parcel.
- Subscribes to Firestore for realtime changes (by tracking_id).
- Timeline uses parcel.updates when present.
- Guarded map rendering for missing coordinates.
- Share button copies /tracking?trackingId=... to clipboard.

## Admin Dashboard
- React Query for data fetching and invalidation after mutations.
- Add Parcel modal with validation, toast errors, and success flows.
- Inline edit: status, lat, lng, address; Save/Cancel controls.
- Delete confirmation to prevent accidental deletion.

## PWA
- vite-plugin-pwa precaches core assets via globPatterns.
- maximumFileSizeToCacheInBytes increased to 6 MiB to cache larger JS chunks.
- InstallPrompt listens to beforeinstallprompt to show a CTA on mobile.

## Styling
- Tailwind CSS v4 utilities with brand colors: primary #1E3A8A, accent #10B981.
- index.css contains Tailwind layers and CSS variables; removed template flex-centering.

## Common Issues
- White screen: check console for runtime errors; ensure vite alias '@' is configured and Firebase Analytics guarded.
- 401/403 from backend: ensure JWT token exists and role is admin for admin routes.
- Map not visible: ensure parcel.location.lat/lng are numbers.

## Contributing
- Use small, focused components and React Query for data-fetching.
- Add ARIA attributes for icon-only buttons.
- Prefer toasts for non-blocking UX feedback.

