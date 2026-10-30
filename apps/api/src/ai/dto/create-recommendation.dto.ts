import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecommendationDto {
  @IsString()
  @IsNotEmpty()
  uploadId!: string;

  /**
   * Bila disertakan, endpoint beralih ke mode AI Fine-Tune: menyarankan
   * penyesuaian kecil untuk platform yang SUDAH DIPILIH ini, alih-alih
   * meranking seluruh preset.
   */
  @IsOptional()
  @IsString()
  presetId?: string;
}
