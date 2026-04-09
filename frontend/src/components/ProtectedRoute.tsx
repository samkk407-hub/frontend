import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireActive?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireActive = false }) => {
  const { token, status, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/shop/dashboard/login" />;
  }

  if (requireActive && status !== 'active') {
    return <Navigate to="/shop/dashboard/profile" />;
  }

  return <>{children}</>;
};