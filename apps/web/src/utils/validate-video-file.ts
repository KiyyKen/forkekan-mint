/**
 * Validasi client sebelum upload — docs/07-api-specification.md
 * (Validation Rules: maks 500 MB; MP4, MOV, AVI, MKV, WEBM).
 * Daftar yang sama diberlakukan server (apps/api uploads.constants.ts).
 */

const BYTES_PER_MEGABYTE = 1024 * 1024;

export const MAX_UPLOAD_SIZE_MB = 500;

export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * BYTES_PER_MEGABYTE;

export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'] as const;

/** Nilai atribut `accept` untuk input file. */
export const VIDEO_FILE_ACCEPT = ALLOWED_VIDEO_EXTENSIONS.join(',');

export type VideoFileValidation = { valid: true } | { valid: false; reason: string };

export function validateVideoFile(file: File): VideoFileValidation {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (!(ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(extension)) {
    return {
      valid: false,
      reason: 'Format file tidak didukung. Gunakan MP4, MOV, AVI, MKV, atau WEBM.',
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      reason: `Ukuran file melebihi batas ${MAX_UPLOAD_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}
