import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions, Queue } from 'bullmq';

import { VIDEO_PROCESSING_QUEUE } from './queue.constants';

const DEFAULT_REDIS_URL = 'redis://localhost:6379';

/**
 * Producer tunggal queue video-processing.
 * Seluruh module (uploads, processing) menambahkan job lewat service ini.
 */
@Injectable()
export class VideoProcessingQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(VideoProcessingQueueService.name);
  private readonly queue: Queue;

  constructor(configService: ConfigService) {
    this.queue = new Queue(VIDEO_PROCESSING_QUEUE, {
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
   * Menambahkan job ke queue. Mengembalikan false (tanpa melempar) bila
   * queue tidak dapat dihubungi — pemanggil memutuskan konsekuensinya.
   */
  async add<TData>(jobName: string, data: TData, options?: JobsOptions): Promise<boolean> {
    try {
      await this.queue.add(jobName, data, options);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Gagal mengantrekan job "${jobName}": ${message}`);
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
