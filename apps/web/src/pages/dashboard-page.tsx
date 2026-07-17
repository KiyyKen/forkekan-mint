import { APP_NAME } from '@forkekan/shared';

import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';

export function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
          <span className="text-sm font-bold">{APP_NAME}</span>
          <div className="flex items-center gap-4">
            {user && <span className="truncate text-sm text-muted-foreground">{user.name}</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              {logout.isPending ? 'Keluar...' : 'Keluar'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
        <h1 className="text-balance text-2xl font-bold">
          {isLoading ? 'Memuat...' : `Halo, ${user?.name ?? 'Pengguna'}`}
        </h1>
        <p className="text-pretty mt-2 text-sm text-muted-foreground">
          Fitur upload dan optimasi video akan tersedia pada fase berikutnya.
        </p>
      </main>
    </div>
  );
}
