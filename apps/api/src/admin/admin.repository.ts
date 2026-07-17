import { Injectable } from '@nestjs/common';
import { JobStatus, Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { AdminJobsQueryDto } from './dto/admin-jobs-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

export type AdminJobRow = {
  id: string;
  status: JobStatus;
  workerName: string | null;
  progress: number;
  createdAt: Date;
  preset: { name: string };
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  countUploads(): Promise<number> {
    return this.prisma.upload.count();
  }

  countJobs(): Promise<number> {
    return this.prisma.processingJob.count();
  }

  /** Total byte file sumber + hasil optimasi yang tercatat di database. */
  async sumStorageBytes(): Promise<bigint> {
    const [media, results] = await this.prisma.$transaction([
      this.prisma.mediaFile.aggregate({ _sum: { fileSize: true } }),
      this.prisma.processingResult.aggregate({ _sum: { outputSize: true } }),
    ]);

    return (media._sum.fileSize ?? BigInt(0)) + (results._sum.outputSize ?? BigInt(0));
  }

  findJobs(query: AdminJobsQueryDto): Promise<AdminJobRow[]> {
    const where: Prisma.ProcessingJobWhereInput = {};

    if (query.status) {
      where.status = query.status.toUpperCase() as JobStatus;
    }
    if (query.worker) {
      where.workerName = query.worker;
    }
    if (query.search) {
      where.OR = [
        { preset: { name: { contains: query.search, mode: 'insensitive' } } },
        { mediaFile: { originalFilename: { contains: query.search, mode: 'insensitive' } } },
        { id: query.search },
      ];
    }

    return this.prisma.processingJob.findMany({
      where,
      select: {
        id: true,
        status: true,
        workerName: true,
        progress: true,
        createdAt: true,
        preset: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  findUsers(query: AdminUsersQueryDto): Promise<AdminUserRow[]> {
    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }
}
