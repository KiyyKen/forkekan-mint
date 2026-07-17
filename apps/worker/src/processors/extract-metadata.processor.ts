import type { Job } from 'bullmq';

import { runFfprobe } from '../ffmpeg/ffprobe';
import type { ExtractMetadataJobData } from '../jobs/job-names';
import { prisma } from '../services/prisma';

/**
 * Mengekstrak metadata video via ffprobe lalu memperbarui MediaFile.
 * Error dilempar agar BullMQ melakukan retry sesuai konfigurasi job;
 * setelah percobaan habis, MediaFile tetap berisi nilai pending.
 */
export async function extractMetadataProcessor(job: Job<ExtractMetadataJobData>): Promise<void> {
  const { mediaFileId, filePath } = job.data;

  console.log(`[worker] Ekstraksi metadata media ${mediaFileId} (job ${job.id})`);

  const metadata = await runFfprobe(filePath);

  await prisma.mediaFile.update({
    where: { id: mediaFileId },
    data: {
      width: metadata.width,
      height: metadata.height,
      duration: metadata.duration,
      fps: metadata.fps,
      bitrate: metadata.bitrate,
      codec: metadata.codec,
      audioCodec: metadata.audioCodec,
      audioBitrate: metadata.audioBitrate,
    },
  });

  console.log(
    `[worker] Metadata media ${mediaFileId} tersimpan: ${metadata.width}x${metadata.height} ` +
      `${metadata.fps}fps ${metadata.codec}/${metadata.audioCodec}`,
  );
}
