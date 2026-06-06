import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Forbidden from '../pages/Forbidden';
import type { UserRole } from '../../shared/types';

interface PrivateRouteProps {
  allowedRoles?: UserRole[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return <Forbidden />;
  }

  return <Outlet />;
}
