const UNITS = ['B', 'KB', 'MB', 'GB'] as const;
const BYTES_PER_UNIT = 1024;

/** Format ukuran file untuk tampilan (mis. "45.2 MB"). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= BYTES_PER_UNIT && unitIndex < UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unitIndex += 1;
  }

  const formatted = unitIndex > 0 ? value.toFixed(1) : String(Math.round(value));
  return `${formatted} ${UNITS[unitIndex]}`;
}
