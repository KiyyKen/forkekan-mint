import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

import { DEFAULT_OUTPUT_DIR } from '../processing/processing.constants';
import { HistoryQueryDto } from './dto/history-query.dto';
import { HistoryRepository } from './history.repository';

/** Item response GET /history — docs/07. `resultId` aditif untuk tombol download. */
export interface HistoryItem {
  id: string;
  preset: string;
  status: string;
  createdAt: Date;
  resultId: string | null;
}

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly outputDir: string;

  constructor(
    private readonly historyRepository: HistoryRepository,
    configService: ConfigService,
  ) {
    this.outputDir = path.resolve(configService.get<string>('OUTPUT_DIR', DEFAULT_OUTPUT_DIR));
  }

  /** Riwayat optimasi milik user (GET /history). */
  async list(userId: string, query: HistoryQueryDto): Promise<HistoryItem[]> {
    const jobs = await this.historyRepository.findJobsForUser(userId, query);

    return jobs.map((job) => ({
      id: job.id,
      preset: job.preset.name,
      status: job.status.toLowerCase(),
      createdAt: job.createdAt,
      resultId: job.result?.id ?? null,
    }));
  }

  /**
   * Menghapus riwayat optimasi (DELETE /history/{id}).
   * Hanya pemilik yang dapat menghapus; file output ikut dibersihkan.
   */
  async remove(userId: string, jobId: string): Promise<{ success: boolean }> {
    const job = await this.historyRepository.findJobOwnedByUser(jobId, userId);
    if (!job) {
      throw new NotFoundException('Riwayat tidak ditemukan');
    }

    await this.historyRepository.deleteJob(jobId);

    if (job.result) {
      const filePath = path.join(this.outputDir, job.result.outputFilename);
      await unlink(filePath).catch((error: Error) => {
        this.logger.warn(`Gagal menghapus file output ${filePath}: ${error.message}`);
      });
    }

    return { success: true };
  }
}
