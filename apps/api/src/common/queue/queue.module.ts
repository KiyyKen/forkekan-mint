import { Module } from '@nestjs/common';

import { VideoProcessingQueueService } from './video-processing-queue.service';

@Module({
  providers: [VideoProcessingQueueService],
  exports: [VideoProcessingQueueService],
})
export class QueueModule {}
