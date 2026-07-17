import { JobStatus, LogLevel } from '@prisma/client';
import type { Job } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { mkdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { runFfmpeg } from '../ffmpeg/ffmpeg';
import type { ProcessVideoJobData } from '../jobs/job-names';
import { prisma } from '../services/prisma';
import { addProcessingLog } from '../services/processing-log';

const OUTPUT_EXTENSION = '.mp4';

/** Simpan progress ke DB hanya tiap kelipatan ini agar tidak membanjiri database. */
const PROGRESS_DB_STEP = 5;

const workerName = `worker-${os.hostname()}`;

/**
 * Encoding video sesuai preset (docs/03: Optimization Flow —
 * Queue → Worker → FFmpeg → Store Result → Update Database).
 * Error dilempar agar BullMQ melakukan retry sesuai konfigurasi job.
 */
export async function processVideoProcessor(job: Job<ProcessVideoJobData>): Promise<void> {
  const { processingJobId, inputPath, outputDir } = job.data;

  const record = await prisma.processingJob.findUnique({
    where: { id: processingJobId },
    include: { preset: true, mediaFile: true },
  });

  if (!record) {
    console.error(`[worker] ProcessingJob ${processingJobId} tidak ditemukan, job dilewati.`);
    return;
  }

  const startedAt = new Date();
  await prisma.processingJob.update({
    where: { id: processingJobId },
    data: {
      status: JobStatus.PROCESSING,
      progress: 0,
      startedAt,
      workerName,
      failedReason: null,
    },
  });
  await addProcessingLog(
    processingJobId,
    LogLevel.INFO,
    `Encoding dimulai oleh ${workerName} (preset ${record.preset.slug}, percobaan ${job.attemptsMade + 1})`,
  );

  try {
    await mkdir(outputDir, { recursive: true });

    const outputFilename = `${randomUUID()}${OUTPUT_EXTENSION}`;
    const outputPath = path.join(outputDir, outputFilename);

    let lastSavedProgress = 0;
    await runFfmpeg(inputPath, outputPath, record.preset, record.mediaFile.duration, (percent) => {
      void job.updateProgress(percent);

      if (percent - lastSavedProgress >= PROGRESS_DB_STEP) {
        lastSavedProgress = percent;
        void prisma.processingJob
          .update({ where: { id: processingJobId }, data: { progress: percent } })
          .catch(() => undefined);
      }
    });

    const outputStats = await stat(outputPath);
    const processingTimeSeconds = Math.round((Date.now() - startedAt.getTime()) / 1000);

    await prisma.$transaction([
      prisma.processingResult.create({
        data: {
          processingJobId,
          outputFilename,
          outputSize: BigInt(outputStats.size),
          outputResolution: record.preset.targetResolution,
          outputCodec: record.preset.targetCodec,
          outputBitrate: record.preset.targetBitrate,
          processingTime: processingTimeSeconds,
        },
      }),
      prisma.processingJob.update({
        where: { id: processingJobId },
        data: { status: JobStatus.COMPLETED, progress: 100, finishedAt: new Date() },
      }),
    ]);
    await addProcessingLog(
      processingJobId,
      LogLevel.INFO,
      `Encoding selesai dalam ${processingTimeSeconds}s → ${outputFilename}`,
    );

    console.log(`[worker] Job ${processingJobId} selesai: ${outputFilename}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    await prisma.processingJob.update({
      where: { id: processingJobId },
      data: { status: JobStatus.FAILED, failedReason: reason, finishedAt: new Date() },
    });
    await addProcessingLog(processingJobId, LogLevel.ERROR, `Encoding gagal: ${reason}`);

    throw error;
  }
}
