import { Download } from 'lucide-react';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDownloadResult, useProcessingResult } from '@/hooks/use-processing';
import type { HistoryItem } from '@/types/history';
import { formatDate } from '@/utils/format-date';

interface HistoryDetailDialogProps {
  item: HistoryItem | null;
  onClose: () => void;
}

/** Detail satu riwayat optimasi + tombol download hasil. */
export function HistoryDetailDialog({ item, onClose }: HistoryDetailDialogProps) {
  const result = useProcessingResult(item?.id ?? null, item?.status === 'completed');
  const download = useDownloadResult();

  return (
    <Dialog open={item !== null} onClose={onClose} title="Detail optimasi">
      {item && (
        <div className="space-y-4">
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
            {result.data && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Resolusi hasil</dt>
                  <dd className="tabular-nums">{result.data.resolution}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Codec</dt>
                  <dd>{result.data.codec}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Ukuran</dt>
                  <dd className="tabular-nums">{result.data.size}</dd>
                </div>
              </>
            )}
          </dl>

          {item.status === 'completed' && (
            <Button
              className="w-full"
              disabled={download.isPending}
              onClick={() => download.mutate(item.id)}
            >
              <Download aria-hidden="true" className="size-4" />
              {download.isPending ? 'Menyiapkan...' : 'Download hasil'}
            </Button>
          )}

          {item.status === 'failed' && (
            <p className="text-pretty text-sm text-muted-foreground">
              Optimasi ini gagal. Unggah ulang video untuk mencoba lagi.
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}
