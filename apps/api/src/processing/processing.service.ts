import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobStatus, ProcessingJob } from '@prisma/client';
import path from 'node:path';

import { VideoProcessingQueueService } from '../common/queue/video-processing-queue.service';
import { humanFileSize } from '../common/utils/human-file-size';
import { DownloadsService } from '../downloads/downloads.service';
import { DEFAULT_UPLOAD_DIR } from '../uploads/uploads.constants';
import {
  DEFAULT_OUTPUT_DIR,
  PROCESS_VIDEO_JOB,
  PROCESSING_JOB_ATTEMPTS,
  PROCESSING_JOB_BACKOFF_MS,
} from './processing.constants';
import { ProcessingRepository } from './processing.repository';

export interface CreateProcessingResult {
  jobId: string;
  status: string;
}

export interface ProcessingStatusResult {
  status: string;
  progress: number;
  currentStep: string;
  estimatedRemaining: string | null;
}

export interface ProcessVideoJobData {
  processingJobId: string;
  /** Path absolut file input pada disk lokal. */
  inputPath: string;
  /** Direktori absolut untuk file hasil encoding. */
  outputDir: string;
}

/** Response GET /processing/{jobId}/result — docs/07. */
export interface ProcessingResultResponse {
  downloadUrl: string;
  thumbnail: string | null;
  size: string;
  resolution: string;
  codec: string;
}

/** Tahapan yang dilihat user (docs/03: Processing Flow). */
const STEP_BY_STATUS: Record<JobStatus, string> = {
  [JobStatus.WAITING]: 'Waiting',
  [JobStatus.PROCESSING]: 'Encoding',
  [JobStatus.COMPLETED]: 'Completed',
  [JobStatus.FAILED]: 'Failed',
};

const ENCODING_FINALIZING_THRESHOLD = 90;

@Injectable()
export class ProcessingService {
  private readonly uploadDir: string;
  private readonly outputDir: string;

  constructor(
    private readonly processingRepository: ProcessingRepository,
    private readonly queue: VideoProcessingQueueService,
    private readonly downloadsService: DownloadsService,
    configService: ConfigService,
  ) {
    this.uploadDir = path.resolve(configService.get<string>('UPLOAD_DIR', DEFAULT_UPLOAD_DIR));
    this.outputDir = path.resolve(configService.get<string>('OUTPUT_DIR', DEFAULT_OUTPUT_DIR));
  }

  /**
   * Membuat job optimasi (POST /processing) — docs/07:
   * upload harus tersedia, preset harus valid, dan job yang sama
   * tidak boleh diproses dua kali secara bersamaan.
   */
  async createJob(uploadId: string, presetId: string): Promise<CreateProcessingResult> {
    const upload = await this.processingRepository.findUploadWithMedia(uploadId);
    if (!upload) {
      throw new NotFoundException('Upload tidak ditemukan');
    }
    if (!upload.mediaFile) {
      throw new BadRequestException('Upload belum memiliki media file');
    }

    const preset = await this.processingRepository.findPresetById(presetId);
    if (!preset) {
      throw new NotFoundException('Preset tidak ditemukan');
    }

    const activeJob = await this.processingRepository.findActiveJob(upload.mediaFile.id, presetId);
    if (activeJob) {
      throw new ConflictException('Video ini sedang diproses dengan preset yang sama');
    }

    const job = await this.processingRepository.createJob(upload.mediaFile.id, presetId);

    const enqueued = await this.queue.add<ProcessVideoJobData>(
      PROCESS_VIDEO_JOB,
      {
        processingJobId: job.id,
        inputPath: path.join(this.uploadDir, upload.mediaFile.storedFilename),
        outputDir: this.outputDir,
      },
      {
        attempts: PROCESSING_JOB_ATTEMPTS,
        backoff: { type: 'exponential', delay: PROCESSING_JOB_BACKOFF_MS },
        removeOnComplete: true,
      },
    );

    if (!enqueued) {
      await this.processingRepository.markJobFailed(job.id, 'Queue tidak tersedia');
      throw new ServiceUnavailableException('Antrean processing tidak tersedia, coba lagi nanti');
    }

    return {
      jobId: job.id,
      status: this.toApiStatus(job.status),
    };
  }

  /**
   * Status processing (GET /processing/{jobId}).
   */
  async getStatus(jobId: string): Promise<ProcessingStatusResult> {
    const job = await this.processingRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundException('Processing job tidak ditemukan');
    }

    return {
      status: this.toApiStatus(job.status),
      progress: job.progress,
      currentStep: this.toCurrentStep(job),
      estimatedRemaining: this.toEstimatedRemaining(job),
    };
  }

  /**
   * Hasil optimasi (GET /processing/{jobId}/result).
   * downloadUrl adalah Signed URL berumur pendek yang sama dengan
   * yang diterbitkan GET /downloads/{resultId}.
   */
  async getResult(jobId: string): Promise<ProcessingResultResponse> {
    const job = await this.processingRepository.findJobWithResult(jobId);
    if (!job) {
      throw new NotFoundException('Processing job tidak ditemukan');
    }
    if (!job.result) {
      throw new NotFoundException('Hasil optimasi belum tersedia');
    }

    const { downloadUrl } = await this.downloadsService.createSignedDownload(job.result.id, null);

    return {
      downloadUrl,
      thumbnail: job.result.previewThumbnail,
      size: humanFileSize(Number(job.result.outputSize)),
      resolution: job.result.outputResolution,
      codec: job.result.outputCodec,
    };
  }

  /** Kontrak API memakai status lowercase ("waiting"), enum Prisma uppercase. */
  private toApiStatus(status: JobStatus): string {
    return status.toLowerCase();
  }

  private toCurrentStep(job: ProcessingJob): string {
    if (job.status === JobStatus.PROCESSING) {
      if (job.progress === 0) {
        return 'Preparing';
      }
      return job.progress >= ENCODING_FINALIZING_THRESHOLD ? 'Finalizing' : 'Encoding';
    }
    return STEP_BY_STATUS[job.status];
  }

  /**
   * Estimasi sisa waktu dari laju progress berjalan (mis. "12s").
   * Null bila belum dapat dihitung (waiting/failed/progress 0).
   */
  private toEstimatedRemaining(job: ProcessingJob): string | null {
    if (job.status === JobStatus.COMPLETED) {
      return '0s';
    }
    if (job.status !== JobStatus.PROCESSING || !job.startedAt || job.progress <= 0) {
      return null;
    }

    const elapsedMs = Date.now() - job.startedAt.getTime();
    const remainingMs = (elapsedMs / job.progress) * (100 - job.progress);
    return `${Math.max(0, Math.round(remainingMs / 1000))}s`;
  }
}
