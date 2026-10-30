import { Injectable } from '@nestjs/common';
import { MediaFile, PlatformPreset } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type UploadWithMedia = {
  id: string;
  mediaFile: MediaFile | null;
};

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUploadWithMedia(uploadId: string): Promise<UploadWithMedia | null> {
    return this.prisma.upload.findUnique({
      where: { id: uploadId },
      select: { id: true, mediaFile: true },
    });
  }

  findAllPresets(): Promise<PlatformPreset[]> {
    return this.prisma.platformPreset.findMany();
  }

  findPresetById(presetId: string): Promise<PlatformPreset | null> {
    return this.prisma.platformPreset.findUnique({ where: { id: presetId } });
  }
}
