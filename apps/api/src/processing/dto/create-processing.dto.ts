import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AiTuningDto } from './ai-tuning.dto';

export class CreateProcessingDto {
  @IsString()
  @IsNotEmpty()
  uploadId!: string;

  @IsString()
  @IsNotEmpty()
  presetId!: string;

  /** Override opsional dari AI Fine-Tune di atas Platform Profile yang dipilih. */
  @IsOptional()
  @ValidateNested()
  @Type(() => AiTuningDto)
  aiTuning?: AiTuningDto;
}
