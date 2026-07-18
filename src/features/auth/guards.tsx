import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RequireAuth() {
  const { admin, loading } = useAuth();
  if (loading) return null;
  if (!admin) return <Navigate to="/signin" replace />;
  return <Outlet />;
}
