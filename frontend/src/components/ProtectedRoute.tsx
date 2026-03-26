import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const token = localStorage.getItem('token');

  if (requireAuth && (!isAuthenticated || !token)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
