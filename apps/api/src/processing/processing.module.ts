import { Module } from '@nestjs/common';

import { QueueModule } from '../common/queue/queue.module';
import { DownloadsModule } from '../downloads/downloads.module';
import { ProcessingController } from './processing.controller';
import { ProcessingRepository } from './processing.repository';
import { ProcessingService } from './processing.service';

@Module({
  imports: [QueueModule, DownloadsModule],
  controllers: [ProcessingController],
  providers: [ProcessingService, ProcessingRepository],
})
export class ProcessingModule {}
