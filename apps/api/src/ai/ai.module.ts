import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository],
})
export class AiModule {}
