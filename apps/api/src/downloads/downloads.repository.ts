import { Injectable } from '@nestjs/common';
import { Download, ProcessingResult } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DownloadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findResultById(resultId: string): Promise<ProcessingResult | null> {
    return this.prisma.processingResult.findUnique({ where: { id: resultId } });
  }

  /** Riwayat download hanya dicatat untuk user login (Download.userId wajib). */
  recordDownload(userId: string, processingResultId: string): Promise<Download> {
    return this.prisma.download.create({
      data: { userId, processingResultId },
    });
  }
}
