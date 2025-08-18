# Rush Delivery - Real-time Logistics Tracker

A modern, responsive Progressive Web App (PWA) for real-time parcel tracking and delivery management.

## Features

### Core Features
- **Real-time Tracking**: Live map tracking with Leaflet integration
- **Multi-platform Support**: Responsive design for desktop, tablet, and mobile
- **Progressive Web App**: Installable on devices with offline support
- **Role-based Access**: Client and Admin dashboards
- **Instant Notifications**: Real-time updates via Firebase
- **Secure Authentication**: JWT-based authentication with Firebase

### Technical Features
- **React 19** with latest features
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **React Router** for navigation
- **TanStack Query** for data management
- **Firebase** for backend services
- **FastAPI** backend with Python
- **Leaflet** for interactive maps
- **Lottie** animations for enhanced UX

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd rush-delivery
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Environment Setup**
Create `.env` files in both frontend and backend directories:

**Frontend/.env**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend/.env**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json
JWT_SECRET=your_jwt_secret
```

5. **Start the development servers**

**Backend**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm run dev
```

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── Navbar.jsx    # Navigation component
│   │   ├── Footer.jsx    # Footer component
│   │   └── BottomNav.jsx # Mobile navigation
│   ├── pages/            # Page components
│   │   ├── Home.jsx      # Landing page
│   │   ├── Tracking.jsx  # Parcel tracking page
│   │   ├── AdminDashboard.jsx # Admin interface
│   │   ├── Profile.jsx   # User profile
│   │   ├── Login.jsx     # Authentication
│   │   ├── About.jsx     # About page
│   │   ├── Contact.jsx   # Contact page
│   │   └── NotFound.jsx  # 404 page
│   ├── assets/           # Static assets
│   ├── lib/             # Utility functions
│   └── firebase.js      # Firebase configuration
├── public/              # Public assets
└── package.json         # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## PWA Features

The app includes full PWA support:
- Install prompt on mobile devices
- Offline functionality
- Push notifications
- App-like experience
- Responsive design

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login

### Parcels
- `GET /parcels` - Get all parcels (admin only)
- `GET /parcels/:tracking_id` - Get specific parcel
- `POST /parcels` - Create new parcel (admin only)
- `PUT /parcels/:id` - Update parcel (admin only)
- `DELETE /parcels/:id` - Delete parcel (admin only)

### WebSocket
- `WS /ws/:tracking_id` - Real-time updates

## Technologies Used

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **Leaflet** - Maps
- **Lottie** - Animations

### Backend
- **FastAPI** - Web framework
- **Firebase Admin SDK** - Authentication & database
- **PyJWT** - JWT tokens
- **Passlib** - Password hashing

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Firebase** - Database & authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@rushdelivery.com or join our Discord server.
