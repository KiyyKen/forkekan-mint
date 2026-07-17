/**
 * Aturan validasi upload — docs/07-api-specification.md (Validation Rules).
 * Catatan: daftar yang sama dipakai validasi client di apps/web
 * (src/utils/validate-video-file.ts); jaga keduanya tetap sinkron.
 */

const BYTES_PER_MEGABYTE = 1024 * 1024;

export const MAX_UPLOAD_SIZE_MB = 500;

export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * BYTES_PER_MEGABYTE;

export const UPLOAD_FIELD_NAME = 'video';

/** Ekstensi → MIME type yang diizinkan. */
export const ALLOWED_VIDEO_TYPES: ReadonlyMap<string, readonly string[]> = new Map([
  ['.mp4', ['video/mp4']],
  ['.mov', ['video/quicktime']],
  ['.avi', ['video/x-msvideo', 'video/avi']],
  ['.mkv', ['video/x-matroska']],
  ['.webm', ['video/webm']],
]);

export const DEFAULT_UPLOAD_DIR = 'storage/uploads';

/** Disk StorageObject untuk penyimpanan lokal (docs/04-erd.md). */
export const LOCAL_STORAGE_DISK = 'local';

/** Sentinel metadata sebelum ekstraksi ffprobe oleh worker (fase berikutnya). */
export const METADATA_PENDING_NUMBER = 0;
export const METADATA_PENDING_CODEC = 'unknown';
