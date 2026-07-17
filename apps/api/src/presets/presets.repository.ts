import { Injectable } from '@nestjs/common';
import { PlatformPreset } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PresetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PlatformPreset[]> {
    return this.prisma.platformPreset.findMany({ orderBy: { name: 'asc' } });
  }
}
