import { IsInt, IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

/**
 * Override opsional dari AI Fine-Tune — hanya 4 parameter yang boleh
 * disentuh AI (CRF, bitrate, fps, scale), tidak pernah menggantikan
 * Platform Profile itu sendiri.
 */
export class AiTuningDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(51)
  crf?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  bitrate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  fps?: number;

  @IsOptional()
  @Matches(/^\d+x\d+$/, { message: 'scale harus berformat "LEBARxTINGGI"' })
  scale?: string;
}
