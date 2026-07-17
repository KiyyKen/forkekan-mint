import { Link, NavLink } from 'react-router-dom';

import { APP_NAME } from '@forkekan/shared';

import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/upload', label: 'Upload' },
  { to: '/history', label: 'Riwayat' },
] as const;

const ADMIN_NAV_ITEM = { to: '/admin', label: 'Admin' } as const;

/** Header area login (docs/09: Dashboard Structure — Header). */
export function AppHeader() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const navItems = user?.role === 'ADMIN' ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : [...NAV_ITEMS];

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {APP_NAME}
          </Link>
          <nav aria-label="Navigasi utama" className="flex items-center gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive && 'font-medium text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="hidden truncate text-sm text-muted-foreground sm:inline">{user.name}</span>}
          <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
            {logout.isPending ? 'Keluar...' : 'Keluar'}
          </Button>
        </div>
      </div>
    </header>
  );
}
