import { OptimizationResult } from '@/components/optimization-result';
import { Dialog } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDownloadResult, useProcessingResult } from '@/hooks/use-processing';
import type { HistoryItem } from '@/types/history';
import { formatDate } from '@/utils/format-date';

interface HistoryDetailDialogProps {
  item: HistoryItem | null;
  onClose: () => void;
}

/**
 * Detail satu riwayat optimasi. Untuk hasil sukses, memakai komponen
 * OptimizationResult yang sama dengan alur pasca-processing — tidak ada
 * compatibilityScore/processingTime karena data itu tidak tersimpan untuk
 * riwayat lama (hanya ada pada sesi optimasi langsung).
 */
export function HistoryDetailDialog({ item, onClose }: HistoryDetailDialogProps) {
  const result = useProcessingResult(item?.id ?? null, item?.status === 'completed');
  const download = useDownloadResult();

  return (
    <Dialog open={item !== null} onClose={onClose} title="Detail optimasi">
      {item && (
        <div className="space-y-4">
          {item.status === 'completed' ? (
            result.data ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Diproses {formatDate(item.createdAt)}
                </p>
                <OptimizationResult
                  presetName={item.preset}
                  resolution={result.data.resolution}
                  codec={result.data.codec}
                  size={result.data.size}
                  isDownloading={download.isPending}
                  onDownload={() => download.mutate(item.id)}
                />
              </>
            ) : (
              <div role="status" aria-label="Memuat detail hasil" className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              </div>
            )
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Platform</dt>
                <dd className="font-medium">{item.preset}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={item.status} />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dibuat</dt>
                <dd className="tabular-nums">{formatDate(item.createdAt)}</dd>
              </div>
            </dl>
          )}

          {item.status === 'failed' && (
            <p className="text-pretty text-sm text-muted-foreground">
              Optimasi ini gagal. Unggah ulang video untuk mencoba lagi.
            </p>
          )}

          {(item.status === 'waiting' || item.status === 'processing') && (
            <p className="text-pretty text-sm text-muted-foreground">
              Video ini masih diproses. Cek kembali sebentar lagi.
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}
