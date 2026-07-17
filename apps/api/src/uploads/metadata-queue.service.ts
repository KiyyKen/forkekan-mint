import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

import {
  EXTRACT_METADATA_JOB,
  METADATA_JOB_ATTEMPTS,
  METADATA_JOB_BACKOFF_MS,
  VIDEO_PROCESSING_QUEUE,
} from './uploads.constants';

export interface ExtractMetadataJobData {
  mediaFileId: string;
  /** Path absolut file video pada disk lokal. */
  filePath: string;
}

const DEFAULT_REDIS_URL = 'redis://localhost:6379';

/**
 * Producer job ekstraksi metadata (C4: Upload → Create Queue Job → BullMQ → Worker).
 */
@Injectable()
export class MetadataQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(MetadataQueueService.name);
  private readonly queue: Queue<ExtractMetadataJobData>;

  constructor(configService: ConfigService) {
    this.queue = new Queue<ExtractMetadataJobData>(VIDEO_PROCESSING_QUEUE, {
      connection: {
        url: configService.get<string>('REDIS_URL', DEFAULT_REDIS_URL),
        // Producer tidak boleh menggantung request saat Redis tidak tersedia.
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      },
    });

    this.queue.on('error', (error) => {
      this.logger.warn(`Koneksi queue bermasalah: ${error.message}`);
    });
  }

  /**
   * Antrekan ekstraksi metadata untuk media file yang baru diunggah.
   * Kegagalan enqueue tidak menggagalkan upload; metadata tetap berstatus
   * pending dan dapat diekstrak ulang.
   */
  async enqueueExtractMetadata(data: ExtractMetadataJobData): Promise<void> {
    try {
      await this.queue.add(EXTRACT_METADATA_JOB, data, {
        attempts: METADATA_JOB_ATTEMPTS,
        backoff: { type: 'exponential', delay: METADATA_JOB_BACKOFF_MS },
        removeOnComplete: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Gagal mengantrekan ekstraksi metadata untuk media ${data.mediaFileId}: ${message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
