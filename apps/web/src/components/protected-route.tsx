import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Membatasi route untuk user yang sudah login.
 * User tanpa sesi diarahkan ke halaman login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
