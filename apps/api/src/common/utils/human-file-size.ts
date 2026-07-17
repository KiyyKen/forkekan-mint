const UNITS = ['B', 'KB', 'MB', 'GB'] as const;
const BYTES_PER_UNIT = 1024;
/** Di bawah nilai ini tampilkan satu desimal (mis. "9.5 MB"), selebihnya bulat ("18 MB"). */
const DECIMAL_THRESHOLD = 10;

/**
 * Format ukuran file untuk API response (contoh docs/07: "18 MB").
 */
export function humanFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= BYTES_PER_UNIT && unitIndex < UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unitIndex += 1;
  }

  const formatted = value < DECIMAL_THRESHOLD && unitIndex > 0 ? value.toFixed(1) : String(Math.round(value));
  return `${formatted} ${UNITS[unitIndex]}`;
}
