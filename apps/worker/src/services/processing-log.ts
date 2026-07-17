import { LogLevel } from '@prisma/client';

import { prisma } from './prisma';

/**
 * Mencatat aktivitas worker ke ProcessingLog (docs/08).
 * Kegagalan menulis log tidak boleh menggagalkan proses utama.
 */
export async function addProcessingLog(
  processingJobId: string,
  level: LogLevel,
  message: string,
): Promise<void> {
  try {
    await prisma.processingLog.create({
      data: { processingJobId, level, message },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[worker] Gagal menulis processing log (${processingJobId}): ${reason}`);
  }
}
