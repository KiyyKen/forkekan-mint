import { cn } from '@/utils/cn';

type BadgeStatus = 'waiting' | 'processing' | 'completed' | 'failed';

const STATUS_STYLES: Record<BadgeStatus, string> = {
  waiting: 'bg-secondary text-secondary-foreground',
  processing: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
};

const STATUS_LABELS: Record<BadgeStatus, string> = {
  waiting: 'Menunggu',
  processing: 'Diproses',
  completed: 'Selesai',
  failed: 'Gagal',
};

/** Badge status job (docs/09: Badge — Status/Queue). */
export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
