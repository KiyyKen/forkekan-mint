import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProcessingDto {
  @IsString()
  @IsNotEmpty()
  uploadId!: string;

  @IsString()
  @IsNotEmpty()
  presetId!: string;
}
