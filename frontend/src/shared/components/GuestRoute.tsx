import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

function homeForUser(isSuperAdmin: boolean) {
  return isSuperAdmin ? '/admin' : '/app';
}

export function GuestRoute() {
  const { isAuthenticated, bootstrapping, user } = useAuth();

  if (bootstrapping) {
    return (
      <div className="boot-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={homeForUser(user.isSuperAdmin)} replace />;
  }

  return <Outlet />;
}
