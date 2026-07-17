/**
 * Queue BullMQ untuk background processing (C4: NestJS → BullMQ → Worker).
 * Nama yang sama dipakai worker (apps/worker/src/jobs/queue-names.ts);
 * jaga keduanya tetap sinkron.
 */
export const VIDEO_PROCESSING_QUEUE = 'video-processing';
