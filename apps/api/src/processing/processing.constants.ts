/**
 * Job encoding video pada queue video-processing.
 * Nama yang sama dipakai worker (apps/worker/src/jobs); jaga tetap sinkron.
 */
export const PROCESS_VIDEO_JOB = 'process-video';

export const PROCESSING_JOB_ATTEMPTS = 3;
export const PROCESSING_JOB_BACKOFF_MS = 5_000;

/** Lokasi output hasil encoding (relatif terhadap apps/api saat development). */
export const DEFAULT_OUTPUT_DIR = 'storage/outputs';
