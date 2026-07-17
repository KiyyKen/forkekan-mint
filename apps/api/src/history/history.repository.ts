import { Injectable } from '@nestjs/common';
import { JobStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { HistoryQueryDto } from './dto/history-query.dto';

export type HistoryJob = {
  id: string;
  status: JobStatus;
  createdAt: Date;
  preset: { name: string };
  result: { id: string; outputFilename: string } | null;
};

@Injectable()
export class HistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findJobsForUser(userId: string, query: HistoryQueryDto): Promise<HistoryJob[]> {
    const where: Prisma.ProcessingJobWhereInput = {
      mediaFile: { upload: { userId } },
    };

    if (query.status) {
      where.status = query.status.toUpperCase() as JobStatus;
    }
    if (query.platform) {
      where.preset = { slug: query.platform };
    }
    if (query.search) {
      where.OR = [
        { preset: { name: { contains: query.search, mode: 'insensitive' } } },
        { mediaFile: { originalFilename: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.processingJob.findMany({
      where,
      select: {
        id: true,
        status: true,
        createdAt: true,
        preset: { select: { name: true } },
        result: { select: { id: true, outputFilename: true } },
      },
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  findJobOwnedByUser(jobId: string, userId: string): Promise<HistoryJob | null> {
    return this.prisma.processingJob.findFirst({
      where: {
        id: jobId,
        mediaFile: { upload: { userId } },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        preset: { select: { name: true } },
        result: { select: { id: true, outputFilename: true } },
      },
    });
  }

  /** Menghapus job beserta result & log (cascade — docs/08). */
  async deleteJob(jobId: string): Promise<void> {
    await this.prisma.processingJob.delete({ where: { id: jobId } });
  }
}
