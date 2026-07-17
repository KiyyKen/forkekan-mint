import { Worker, type Job } from 'bullmq';
import { config as loadEnv } from 'dotenv';
import IORedis from 'ioredis';

import { VIDEO_PROCESSING_QUEUE } from './jobs/queue-names';

loadEnv({ path: ['.env', '../../.env'] });

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
  // Wajib untuk BullMQ (blocking commands).
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 1000, 15_000),
});

let redisErrorLogged = false;
function onRedisError(error: Error) {
  if (!redisErrorLogged) {
    redisErrorLogged = true;
    console.error(`[worker] Redis tidak dapat dihubungi (${redisUrl}): ${error.message}`);
    console.error('[worker] Jalankan "docker compose up -d" lalu restart worker. Retry otomatis...');
  }
}

connection.on('error', onRedisError);
connection.on('ready', () => {
  redisErrorLogged = false;
  console.log(`[worker] Terhubung ke Redis: ${redisUrl}`);
});

// Processor video (FFmpeg, thumbnail, metadata) akan diimplementasikan
// pada Phase 4 — Processing Pipeline.
const worker = new Worker(
  VIDEO_PROCESSING_QUEUE,
  async (job: Job) => {
    console.log(`[worker] Menerima job ${job.id} (${job.name}) — belum ada processor (Phase 4).`);
  },
  { connection },
);

// BullMQ menduplikasi koneksi Redis secara internal; tanpa handler ini
// error koneksi duplikat tercetak mentah berulang kali.
worker.on('error', onRedisError);

worker.on('failed', (job, error) => {
  console.error(`[worker] Job ${job?.id} gagal: ${error.message}`);
});

console.log(`[worker] Forkekan-mint worker berjalan. Queue: "${VIDEO_PROCESSING_QUEUE}"`);

async function shutdown() {
  console.log('[worker] Menutup worker...');
  await worker.close();
  connection.disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
