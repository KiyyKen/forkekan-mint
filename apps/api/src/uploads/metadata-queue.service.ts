import { Injectable } from '@nestjs/common';

import { VideoProcessingQueueService } from '../common/queue/video-processing-queue.service';
import {
  EXTRACT_METADATA_JOB,
  METADATA_JOB_ATTEMPTS,
  METADATA_JOB_BACKOFF_MS,
} from './uploads.constants';

export interface ExtractMetadataJobData {
  mediaFileId: string;
  /** Path absolut file video pada disk lokal. */
  filePath: string;
}

/**
 * Producer job ekstraksi metadata (C4: Upload → Create Queue Job → BullMQ → Worker).
 * Kegagalan enqueue tidak menggagalkan upload; metadata tetap berstatus
 * pending dan dapat diekstrak ulang.
 */
@Injectable()
export class MetadataQueueService {
  constructor(private readonly queue: VideoProcessingQueueService) {}

  async enqueueExtractMetadata(data: ExtractMetadataJobData): Promise<void> {
    await this.queue.add(EXTRACT_METADATA_JOB, data, {
      attempts: METADATA_JOB_ATTEMPTS,
      backoff: { type: 'exponential', delay: METADATA_JOB_BACKOFF_MS },
      removeOnComplete: true,
    });
  }
}
