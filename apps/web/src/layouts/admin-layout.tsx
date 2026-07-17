import { NavLink, Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/app-header';
import { cn } from '@/utils/cn';

const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Ringkasan', end: true },
  { to: '/admin/jobs', label: 'Queue' },
  { to: '/admin/users', label: 'Pengguna' },
  { to: '/admin/presets', label: 'Preset' },
] as const;

/** Kerangka halaman admin: header aplikasi + subnav antar-halaman admin. */
export function AdminLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />

      <div className="border-b border-border">
        <nav
          aria-label="Navigasi admin"
          className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-6"
        >
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item && item.end}
              className={({ isActive }) =>
                cn(
                  '-mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'border-primary font-medium text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
