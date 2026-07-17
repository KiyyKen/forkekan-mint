import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { HistoryController } from './history.controller';
import { HistoryRepository } from './history.repository';
import { HistoryService } from './history.service';

@Module({
  imports: [AuthModule],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
})
export class HistoryModule {}
