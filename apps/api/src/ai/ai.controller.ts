import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AiService, RecommendationResult, TuningSuggestionResult } from './ai.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Tanpa `presetId`: ranking seluruh preset (mode lama, masih didukung).
   * Dengan `presetId`: mode AI Fine-Tune untuk platform yang sudah dipilih.
   */
  @Post('recommendation')
  @HttpCode(HttpStatus.OK)
  recommend(
    @Body() dto: CreateRecommendationDto,
  ): Promise<RecommendationResult | TuningSuggestionResult> {
    return this.aiService.recommend(dto.uploadId, dto.presetId);
  }
}
