import { Navigate, useLocation } from 'react-router-dom';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

export default function ProtectedRoute({ children, requireRole }) {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRole && payload.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
