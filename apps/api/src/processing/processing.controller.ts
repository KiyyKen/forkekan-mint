import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateProcessingDto } from './dto/create-processing.dto';
import {
  CreateProcessingResult,
  ProcessingResultResponse,
  ProcessingService,
  ProcessingStatusResult,
} from './processing.service';

@Controller('processing')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @Post()
  create(@Body() dto: CreateProcessingDto): Promise<CreateProcessingResult> {
    return this.processingService.createJob(dto.uploadId, dto.presetId);
  }

  @Get(':jobId')
  status(@Param('jobId') jobId: string): Promise<ProcessingStatusResult> {
    return this.processingService.getStatus(jobId);
  }

  @Get(':jobId/result')
  result(@Param('jobId') jobId: string): Promise<ProcessingResultResponse> {
    return this.processingService.getResult(jobId);
  }
}
