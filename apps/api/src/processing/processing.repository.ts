import { Injectable } from '@nestjs/common';
import { JobStatus, PlatformPreset, ProcessingJob, ProcessingResult } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { VIDEO_PROCESSING_QUEUE } from '../common/queue/queue.constants';

export type UploadForProcessing = {
  id: string;
  mediaFile: { id: string; storedFilename: string } | null;
};

const ACTIVE_JOB_STATUSES: JobStatus[] = [JobStatus.WAITING, JobStatus.PROCESSING];

@Injectable()
export class ProcessingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUploadWithMedia(uploadId: string): Promise<UploadForProcessing | null> {
    return this.prisma.upload.findUnique({
      where: { id: uploadId },
      select: {
        id: true,
        mediaFile: { select: { id: true, storedFilename: true } },
      },
    });
  }

  findPresetById(presetId: string): Promise<PlatformPreset | null> {
    return this.prisma.platformPreset.findUnique({ where: { id: presetId } });
  }

  /** Job aktif (waiting/processing) untuk kombinasi media + preset yang sama. */
  findActiveJob(mediaFileId: string, presetId: string): Promise<ProcessingJob | null> {
    return this.prisma.processingJob.findFirst({
      where: {
        mediaFileId,
        presetId,
        status: { in: ACTIVE_JOB_STATUSES },
      },
    });
  }

  createJob(mediaFileId: string, presetId: string): Promise<ProcessingJob> {
    return this.prisma.processingJob.create({
      data: {
        mediaFileId,
        presetId,
        queueName: VIDEO_PROCESSING_QUEUE,
        status: JobStatus.WAITING,
        progress: 0,
      },
    });
  }

  markJobFailed(jobId: string, reason: string): Promise<ProcessingJob> {
    return this.prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        failedReason: reason,
        finishedAt: new Date(),
      },
    });
  }

  findJobById(jobId: string): Promise<ProcessingJob | null> {
    return this.prisma.processingJob.findUnique({ where: { id: jobId } });
  }

  findJobWithResult(jobId: string): Promise<(ProcessingJob & { result: ProcessingResult | null }) | null> {
    return this.prisma.processingJob.findUnique({
      where: { id: jobId },
      include: { result: true },
    });
  }
}
