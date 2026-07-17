import { cn } from '@/utils/cn';

interface ProgressProps {
  /** Nilai 0–100. */
  value: number;
  label: string;
  className?: string;
}

/**
 * Progress bar (docs/09: Progress — Upload, Processing, Download).
 */
export function Progress({ value, label, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('h-2 w-full overflow-hidden rounded-md bg-secondary', className)}
    >
      <div className="h-full bg-primary" style={{ width: `${clamped}%` }} />
    </div>
  );
}
