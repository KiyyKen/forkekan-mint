import { Download, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { AppHeader } from '@/components/app-header';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { HistoryDetailDialog } from '@/components/history-detail-dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDeleteHistory, useHistory } from '@/hooks/use-history';
import { useDownloadResult } from '@/hooks/use-processing';
import { usePresets } from '@/hooks/use-presets';
import type { HistoryItem, HistoryParams } from '@/types/history';
import { formatDate } from '@/utils/format-date';

const PAGE_SIZE = 10;

const DEFAULT_PARAMS: HistoryParams = {
  page: 1,
  limit: PAGE_SIZE,
  order: 'desc',
};

const SELECT_CLASS =
  'h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function HistoryPage() {
  const [params, setParams] = useState<HistoryParams>(DEFAULT_PARAMS);
  const [searchInput, setSearchInput] = useState('');
  const [detailItem, setDetailItem] = useState<HistoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null);

  const history = useHistory(params);
  const presets = usePresets();
  const deleteHistory = useDeleteHistory();
  const download = useDownloadResult();

  function applyFilter(update: Partial<HistoryParams>) {
    setParams((previous) => ({ ...previous, ...update, page: 1 }));
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    applyFilter({ search: searchInput.trim() || undefined });
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }
    deleteHistory.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  }

  const items = history.data ?? [];
  const hasNextPage = items.length === params.limit;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
        <h1 className="text-balance text-2xl font-bold">Riwayat optimasi</h1>
        <p className="text-pretty mt-2 text-sm text-muted-foreground">
          Cari, unduh ulang, atau hapus hasil optimasi Anda.
        </p>

        <form onSubmit={handleSearch} className="mt-8 flex flex-wrap items-center gap-3">
          <input
            type="search"
            aria-label="Cari riwayat"
            placeholder="Cari nama file atau platform..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className={`${SELECT_CLASS} w-full sm:w-64`}
          />
          <Button type="submit" variant="secondary" size="md">
            Cari
          </Button>

          <select
            aria-label="Filter platform"
            value={params.platform ?? ''}
            onChange={(event) => applyFilter({ platform: event.target.value || undefined })}
            className={SELECT_CLASS}
          >
            <option value="">Semua platform</option>
            {presets.data?.map((preset) => (
              <option key={preset.id} value={preset.slug}>
                {preset.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter status"
            value={params.status ?? ''}
            onChange={(event) => applyFilter({ status: event.target.value || undefined })}
            className={SELECT_CLASS}
          >
            <option value="">Semua status</option>
            <option value="completed">Selesai</option>
            <option value="processing">Diproses</option>
            <option value="waiting">Menunggu</option>
            <option value="failed">Gagal</option>
          </select>

          <select
            aria-label="Urutan"
            value={params.order}
            onChange={(event) => applyFilter({ order: event.target.value as 'asc' | 'desc' })}
            className={SELECT_CLASS}
          >
            <option value="desc">Terbaru dulu</option>
            <option value="asc">Terlama dulu</option>
          </select>
        </form>

        <div className="mt-6">
          {history.isPending && (
            <div role="status" aria-label="Memuat riwayat" className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {history.isError && (
            <div role="alert" className="rounded-xl border border-border bg-card p-6">
              <p className="font-medium">Riwayat tidak bisa dimuat</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => history.refetch()}>
                Coba lagi
              </Button>
            </div>
          )}

          {history.isSuccess && items.length === 0 && (
            <div role="status" className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="font-medium">Belum ada riwayat optimasi.</p>
              <p className="text-pretty mt-1 text-sm text-muted-foreground">
                Upload video pertama Anda untuk mulai optimasi.
              </p>
              <Link to="/upload" className="mt-4 inline-block">
                <Button>Upload video</Button>
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.preset}</p>
                    <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetailItem(item)}>
                      Detail
                    </Button>
                    {item.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Download hasil ${item.preset}`}
                        disabled={download.isPending}
                        onClick={() => download.mutate(item.id)}
                      >
                        <Download aria-hidden="true" className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Hapus riwayat ${item.preset}`}
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 aria-hidden="true" className="size-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(params.page > 1 || hasNextPage) && (
          <nav aria-label="Navigasi halaman" className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={params.page <= 1 || history.isPending}
              onClick={() => setParams((previous) => ({ ...previous, page: previous.page - 1 }))}
            >
              Sebelumnya
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">Halaman {params.page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage || history.isPending}
              onClick={() => setParams((previous) => ({ ...previous, page: previous.page + 1 }))}
            >
              Berikutnya
            </Button>
          </nav>
        )}
      </main>

      <HistoryDetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        presetName={deleteTarget?.preset ?? null}
        isDeleting={deleteHistory.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
