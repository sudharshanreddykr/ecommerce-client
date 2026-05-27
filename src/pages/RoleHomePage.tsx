import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const RoleHomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/shop'} replace />;
};

