import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DownloadsController } from './downloads.controller';
import { DownloadsRepository } from './downloads.repository';
import { DownloadsService } from './downloads.service';

@Module({
  imports: [AuthModule],
  controllers: [DownloadsController],
  providers: [DownloadsService, DownloadsRepository],
  exports: [DownloadsService],
})
export class DownloadsModule {}
