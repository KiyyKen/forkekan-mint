import { Link } from 'react-router-dom';

import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useCurrentUser } from '@/hooks/use-auth';
import { useHistory } from '@/hooks/use-history';
import { formatDate } from '@/utils/format-date';

const RECENT_HISTORY_LIMIT = 5;

export function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();
  const recentHistory = useHistory({ page: 1, limit: RECENT_HISTORY_LIMIT, order: 'desc' });

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
        <h1 className="text-balance text-2xl font-bold">
          {isLoading ? 'Memuat...' : `Halo, ${user?.name ?? 'Pengguna'}`}
        </h1>
        <p className="text-pretty mt-2 text-sm text-muted-foreground">
          Unggah video untuk mulai optimasi, atau lihat kembali hasil sebelumnya.
        </p>
        <Link to="/upload" className="mt-6 inline-block">
          <Button>Upload video</Button>
        </Link>

        <section aria-label="Riwayat terbaru" className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Riwayat terbaru</h2>
            <Link
              to="/history"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Lihat semua
            </Link>
          </div>

          <div className="mt-4">
            {recentHistory.isPending && (
              <div role="status" aria-label="Memuat riwayat" className="space-y-3">
                {[0, 1].map((index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            )}

            {recentHistory.isSuccess && recentHistory.data.length === 0 && (
              <div role="status" className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-pretty text-sm text-muted-foreground">
                  Belum ada riwayat optimasi.
                </p>
              </div>
            )}

            {recentHistory.isSuccess && recentHistory.data.length > 0 && (
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {recentHistory.data.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.preset}</p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
