import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JobStatus, ProcessingJob } from '@prisma/client';

import { VideoProcessingQueueService } from '../common/queue/video-processing-queue.service';
import { DownloadsService } from '../downloads/downloads.service';
import { PROCESS_VIDEO_JOB } from './processing.constants';
import { ProcessingRepository } from './processing.repository';
import { ProcessingService } from './processing.service';

describe('ProcessingService', () => {
  let processingService: ProcessingService;

  const processingRepository = {
    findUploadWithMedia: jest.fn(),
    findPresetById: jest.fn(),
    findActiveJob: jest.fn(),
    createJob: jest.fn(),
    markJobFailed: jest.fn(),
    findJobById: jest.fn(),
    findJobWithResult: jest.fn(),
  };

  const queue = {
    add: jest.fn(),
  };

  const downloadsService = {
    createSignedDownload: jest.fn(),
  };

  const upload = {
    id: 'upload-1',
    mediaFile: { id: 'media-1', storedFilename: 'abc.mp4' },
  };

  const preset = { id: 'preset-1', slug: 'whatsapp-story' };

  const waitingJob: ProcessingJob = {
    id: 'job-1',
    mediaFileId: 'media-1',
    presetId: 'preset-1',
    queueName: 'video-processing',
    workerName: null,
    status: JobStatus.WAITING,
    progress: 0,
    startedAt: null,
    finishedAt: null,
    failedReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProcessingService,
        { provide: ProcessingRepository, useValue: processingRepository },
        { provide: VideoProcessingQueueService, useValue: queue },
        { provide: DownloadsService, useValue: downloadsService },
        {
          provide: ConfigService,
          useValue: { get: (_key: string, fallback: string) => fallback },
        },
      ],
    }).compile();

    processingService = moduleRef.get(ProcessingService);
  });

  describe('createJob', () => {
    function mockHappyPath() {
      processingRepository.findUploadWithMedia.mockResolvedValue(upload);
      processingRepository.findPresetById.mockResolvedValue(preset);
      processingRepository.findActiveJob.mockResolvedValue(null);
      processingRepository.createJob.mockResolvedValue(waitingJob);
      queue.add.mockResolvedValue(true);
    }

    it('membuat job dan mengembalikan response sesuai kontrak API', async () => {
      mockHappyPath();

      await expect(processingService.createJob('upload-1', 'preset-1')).resolves.toEqual({
        jobId: 'job-1',
        status: 'waiting',
      });

      expect(processingRepository.createJob).toHaveBeenCalledWith('media-1', 'preset-1');
      expect(queue.add).toHaveBeenCalledWith(
        PROCESS_VIDEO_JOB,
        expect.objectContaining({ processingJobId: 'job-1' }),
        expect.objectContaining({ attempts: 3 }),
      );
    });

    it('menolak upload yang tidak ada', async () => {
      processingRepository.findUploadWithMedia.mockResolvedValue(null);

      await expect(processingService.createJob('missing', 'preset-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('menolak upload tanpa media file', async () => {
      processingRepository.findUploadWithMedia.mockResolvedValue({ id: 'u', mediaFile: null });

      await expect(processingService.createJob('u', 'preset-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('menolak preset yang tidak ada', async () => {
      processingRepository.findUploadWithMedia.mockResolvedValue(upload);
      processingRepository.findPresetById.mockResolvedValue(null);

      await expect(processingService.createJob('upload-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('menolak job duplikat yang masih aktif (docs/07: tidak boleh diproses dua kali)', async () => {
      processingRepository.findUploadWithMedia.mockResolvedValue(upload);
      processingRepository.findPresetById.mockResolvedValue(preset);
      processingRepository.findActiveJob.mockResolvedValue(waitingJob);

      await expect(processingService.createJob('upload-1', 'preset-1')).rejects.toThrow(
        ConflictException,
      );
      expect(processingRepository.createJob).not.toHaveBeenCalled();
    });

    it('menandai job failed dan melempar 503 bila queue tidak tersedia', async () => {
      mockHappyPath();
      queue.add.mockResolvedValue(false);

      await expect(processingService.createJob('upload-1', 'preset-1')).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(processingRepository.markJobFailed).toHaveBeenCalledWith(
        'job-1',
        'Queue tidak tersedia',
      );
    });
  });

  describe('getStatus', () => {
    it('melempar NotFoundException bila job tidak ada', async () => {
      processingRepository.findJobById.mockResolvedValue(null);

      await expect(processingService.getStatus('missing')).rejects.toThrow(NotFoundException);
    });

    it('memetakan job waiting sesuai kontrak API', async () => {
      processingRepository.findJobById.mockResolvedValue(waitingJob);

      await expect(processingService.getStatus('job-1')).resolves.toEqual({
        status: 'waiting',
        progress: 0,
        currentStep: 'Waiting',
        estimatedRemaining: null,
      });
    });

    it('menghitung estimasi sisa waktu saat processing', async () => {
      const startedAt = new Date(Date.now() - 30_000);
      processingRepository.findJobById.mockResolvedValue({
        ...waitingJob,
        status: JobStatus.PROCESSING,
        progress: 60,
        startedAt,
      });

      const result = await processingService.getStatus('job-1');

      expect(result.status).toBe('processing');
      expect(result.currentStep).toBe('Encoding');
      // 30 detik untuk 60% → sekitar 20 detik tersisa.
      expect(result.estimatedRemaining).toMatch(/^(19|20|21)s$/);
    });

    it('memetakan job completed dengan sisa 0s', async () => {
      processingRepository.findJobById.mockResolvedValue({
        ...waitingJob,
        status: JobStatus.COMPLETED,
        progress: 100,
      });

      await expect(processingService.getStatus('job-1')).resolves.toEqual({
        status: 'completed',
        progress: 100,
        currentStep: 'Completed',
        estimatedRemaining: '0s',
      });
    });
  });

  describe('getResult', () => {
    it('mengembalikan hasil sesuai kontrak API dengan ukuran human-readable', async () => {
      processingRepository.findJobWithResult.mockResolvedValue({
        ...waitingJob,
        status: JobStatus.COMPLETED,
        result: {
          id: 'result-1',
          outputFilename: 'out.mp4',
          outputSize: BigInt(18_874_368),
          outputResolution: '720x1280',
          outputCodec: 'h264',
          previewThumbnail: null,
        },
      });
      downloadsService.createSignedDownload.mockResolvedValue({
        downloadUrl: 'http://localhost:4000/api/v1/downloads/result-1/file?token=x',
        expiresIn: 300,
      });

      await expect(processingService.getResult('job-1')).resolves.toEqual({
        downloadUrl: 'http://localhost:4000/api/v1/downloads/result-1/file?token=x',
        thumbnail: null,
        size: '18 MB',
        resolution: '720x1280',
        codec: 'h264',
      });
    });

    it('melempar NotFoundException bila hasil belum tersedia', async () => {
      processingRepository.findJobWithResult.mockResolvedValue({ ...waitingJob, result: null });

      await expect(processingService.getResult('job-1')).rejects.toThrow(NotFoundException);
    });

    it('melempar NotFoundException bila job tidak ada', async () => {
      processingRepository.findJobWithResult.mockResolvedValue(null);

      await expect(processingService.getResult('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
