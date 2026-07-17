import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { useAdminDashboard, useAdminStorage } from '@/hooks/use-admin';

/** Ringkasan sistem (GET /admin/dashboard + GET /admin/storage). */
export function AdminDashboardPage() {
  const dashboard = useAdminDashboard();
  const storage = useAdminStorage();

  return (
    <>
      <h1 className="text-balance text-2xl font-bold">Ringkasan sistem</h1>
      <p className="text-pretty mt-2 text-sm text-muted-foreground">
        Statistik pengguna, upload, processing, dan storage. Diperbarui otomatis.
      </p>

      {dashboard.isError ? (
        <div role="alert" className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="font-medium">Statistik tidak bisa dimuat</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => dashboard.refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total pengguna"
            value={dashboard.data?.totalUsers ?? null}
            isLoading={dashboard.isPending}
          />
          <StatCard
            label="Total upload"
            value={dashboard.data?.totalUploads ?? null}
            isLoading={dashboard.isPending}
          />
          <StatCard
            label="Total proses"
            value={dashboard.data?.totalJobs ?? null}
            isLoading={dashboard.isPending}
          />
          <StatCard
            label="Storage terpakai"
            value={dashboard.data?.storageUsed ?? null}
            isLoading={dashboard.isPending}
          />
        </div>
      )}

      <section aria-label="Kapasitas storage" className="mt-8">
        <h2 className="font-semibold">Storage</h2>
        {storage.isError ? (
          <div role="alert" className="mt-4 rounded-xl border border-border bg-card p-6">
            <p className="font-medium">Data storage tidak bisa dimuat</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => storage.refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Terpakai"
              value={storage.data?.used ?? null}
              hint="Total file sumber dan hasil optimasi yang tercatat."
              isLoading={storage.isPending}
            />
            <StatCard
              label="Tersedia"
              value={storage.data?.available ?? null}
              hint="Sisa kapasitas penyimpanan yang tersedia."
              isLoading={storage.isPending}
            />
          </div>
        )}
      </section>
    </>
  );
}
