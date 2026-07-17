import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AiService, RecommendationResult } from './ai.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommendation')
  @HttpCode(HttpStatus.OK)
  recommend(@Body() dto: CreateRecommendationDto): Promise<RecommendationResult> {
    return this.aiService.recommend(dto.uploadId);
  }
}
