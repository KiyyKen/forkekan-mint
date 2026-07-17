import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useCurrentUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Membatasi route untuk admin (role ADMIN dari GET /auth/me).
 * Tanpa sesi → login; user biasa → dashboard.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const token = useAuthStore((state) => state.token);
  const { data: user, isPending } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Memeriksa akses admin"
        className="flex min-h-dvh items-center justify-center bg-background"
      >
        <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
