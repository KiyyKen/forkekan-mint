import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminJobs } from '@/hooks/use-admin';
import type { AdminJobsParams } from '@/types/admin';
import { formatDate } from '@/utils/format-date';

const PAGE_SIZE = 20;

const DEFAULT_PARAMS: AdminJobsParams = {
  page: 1,
  limit: PAGE_SIZE,
};

const INPUT_CLASS =
  'h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Monitor queue processing lintas user (GET /admin/jobs, refresh 5 detik). */
export function AdminJobsPage() {
  const [params, setParams] = useState<AdminJobsParams>(DEFAULT_PARAMS);
  const [searchInput, setSearchInput] = useState('');
  const [workerInput, setWorkerInput] = useState('');

  const jobs = useAdminJobs(params);

  function applyFilter(update: Partial<AdminJobsParams>) {
    setParams((previous) => ({ ...previous, ...update, page: 1 }));
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    applyFilter({
      search: searchInput.trim() || undefined,
      worker: workerInput.trim() || undefined,
    });
  }

  const items = jobs.data ?? [];
  const hasNextPage = items.length === params.limit;

  return (
    <>
      <h1 className="text-balance text-2xl font-bold">Antrean pemrosesan</h1>
      <p className="text-pretty mt-2 text-sm text-muted-foreground">
        Seluruh proses optimasi dari semua pengguna, diperbarui otomatis setiap 5 detik.
      </p>

      <form onSubmit={handleSearch} className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          aria-label="Cari proses"
          placeholder="Cari preset, nama file, atau ID proses..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className={`${INPUT_CLASS} w-full sm:w-64`}
        />
        <input
          type="text"
          aria-label="Filter worker"
          placeholder="Nama worker..."
          value={workerInput}
          onChange={(event) => setWorkerInput(event.target.value)}
          className={`${INPUT_CLASS} w-full sm:w-48`}
        />
        <Button type="submit" variant="secondary" size="md">
          Cari
        </Button>

        <select
          aria-label="Filter status"
          value={params.status ?? ''}
          onChange={(event) => applyFilter({ status: event.target.value || undefined })}
          className={INPUT_CLASS}
        >
          <option value="">Semua status</option>
          <option value="waiting">Menunggu</option>
          <option value="processing">Diproses</option>
          <option value="completed">Selesai</option>
          <option value="failed">Gagal</option>
        </select>
      </form>

      <div className="mt-6">
        {jobs.isPending && (
          <div role="status" aria-label="Memuat antrean" className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {jobs.isError && (
          <div role="alert" className="rounded-xl border border-border bg-card p-6">
            <p className="font-medium">Antrean tidak bisa dimuat</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => jobs.refetch()}>
              Coba lagi
            </Button>
          </div>
        )}

        {jobs.isSuccess && items.length === 0 && (
          <div role="status" className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="font-medium">Tidak ada proses yang cocok.</p>
            <p className="text-pretty mt-1 text-sm text-muted-foreground">
              Ubah kata kunci atau filter untuk melihat proses lain.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-160 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="px-6 py-3 font-medium">
                    Preset
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Worker
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Progress
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Dibuat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((job) => (
                  <tr key={job.jobId}>
                    <td className="px-6 py-3">
                      <p className="font-medium">{job.preset}</p>
                      <p className="mt-0.5 max-w-40 truncate font-mono text-xs text-muted-foreground">
                        {job.jobId}
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{job.worker ?? '-'}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={job.progress}
                          label={`Progress ${job.preset}`}
                          className="w-24"
                        />
                        <span className="tabular-nums text-muted-foreground">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 tabular-nums text-muted-foreground">
                      {formatDate(job.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(params.page > 1 || hasNextPage) && (
        <nav aria-label="Navigasi halaman" className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={params.page <= 1 || jobs.isPending}
            onClick={() => setParams((previous) => ({ ...previous, page: previous.page - 1 }))}
          >
            Sebelumnya
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">Halaman {params.page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || jobs.isPending}
            onClick={() => setParams((previous) => ({ ...previous, page: previous.page + 1 }))}
          >
            Berikutnya
          </Button>
        </nav>
      )}
    </>
  );
}
