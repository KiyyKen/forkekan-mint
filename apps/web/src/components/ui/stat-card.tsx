interface StatCardProps {
  label: string;
  value: string | number | null;
  /** Keterangan pendek di bawah nilai (opsional). */
  hint?: string;
  isLoading?: boolean;
}

/** Kartu statistik untuk dashboard admin. */
export function StatCard({ label, value, hint, isLoading = false }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <div role="status" aria-label={`Memuat ${label}`} className="mt-2 h-8 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="mt-1 text-2xl font-bold tabular-nums">{value ?? '-'}</p>
      )}
      {hint && <p className="text-pretty mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
