import { History, LogOut, ShieldCheck, UploadCloud, Video } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { APP_NAME } from '@forkekan/shared';

import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/utils/cn';

const NAV_LINK_CLASS =
  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const NAV_LINK_ACTIVE_CLASS = 'bg-accent text-foreground';

/**
 * Header aplikasi tunggal — dipakai di seluruh halaman (landing, upload,
 * dashboard, riwayat, admin) agar navigasi konsisten untuk guest maupun
 * user login (docs/09: Header). Item nav hanya ditampilkan bila relevan:
 * Upload selalu tampil (auth optional), Riwayat/Admin hanya untuk user
 * login (Admin juga mensyaratkan role ADMIN).
 */
export function AppHeader() {
  const token = useAuthStore((state) => state.token);
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const isAuthenticated = token !== null;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-2">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Video aria-hidden="true" className="size-4" />
            </span>
            <span className="text-sm font-bold tracking-tight">{APP_NAME}</span>
          </Link>

          <nav aria-label="Navigasi utama" className="ml-2 flex items-center gap-1 sm:ml-4">
            <NavLink
              to="/upload"
              aria-label="Upload"
              className={({ isActive }) => cn(NAV_LINK_CLASS, isActive && NAV_LINK_ACTIVE_CLASS)}
            >
              <UploadCloud aria-hidden="true" className="size-4" />
              <span aria-hidden="true" className="hidden sm:inline">
                Upload
              </span>
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/history"
                aria-label="Riwayat"
                className={({ isActive }) => cn(NAV_LINK_CLASS, isActive && NAV_LINK_ACTIVE_CLASS)}
              >
                <History aria-hidden="true" className="size-4" />
                <span aria-hidden="true" className="hidden sm:inline">
                  Riwayat
                </span>
              </NavLink>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                aria-label="Admin"
                className={({ isActive }) => cn(NAV_LINK_CLASS, isActive && NAV_LINK_ACTIVE_CLASS)}
              >
                <ShieldCheck aria-hidden="true" className="size-4" />
                <span aria-hidden="true" className="hidden sm:inline">
                  Admin
                </span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          <span aria-hidden="true" className="h-5 w-px bg-border" />
          {isAuthenticated ? (
            <>
              {user ? (
                <Avatar name={user.name} avatarUrl={user.avatarUrl} />
              ) : (
                <span aria-hidden="true" className="size-8 animate-pulse rounded-full bg-muted" />
              )}
              {user && (
                <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                  {user.name}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                aria-label="Keluar"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut aria-hidden="true" className="size-4" />
                <span aria-hidden="true" className="hidden sm:inline">
                  {logout.isPending ? 'Keluar...' : 'Keluar'}
                </span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
