import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JobStatus } from '@prisma/client';

import { HistoryQueryDto } from './dto/history-query.dto';
import { HistoryRepository } from './history.repository';
import { HistoryService } from './history.service';

jest.mock('node:fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

import { unlink } from 'node:fs/promises';

describe('HistoryService', () => {
  let historyService: HistoryService;

  const historyRepository = {
    findJobsForUser: jest.fn(),
    findJobOwnedByUser: jest.fn(),
    deleteJob: jest.fn(),
  };

  const storedJob = {
    id: 'job-1',
    status: JobStatus.COMPLETED,
    createdAt: new Date('2026-07-17T00:00:00Z'),
    preset: { name: 'WhatsApp Story' },
    result: { id: 'result-1', outputFilename: 'out.mp4' },
  };

  function query(overrides: Partial<HistoryQueryDto> = {}): HistoryQueryDto {
    return Object.assign(new HistoryQueryDto(), overrides);
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        HistoryService,
        { provide: HistoryRepository, useValue: historyRepository },
        {
          provide: ConfigService,
          useValue: { get: (_key: string, fallback: string) => fallback },
        },
      ],
    }).compile();

    historyService = moduleRef.get(HistoryService);
  });

  describe('list', () => {
    it('memetakan riwayat sesuai kontrak API (status lowercase, nama preset)', async () => {
      historyRepository.findJobsForUser.mockResolvedValue([storedJob]);

      await expect(historyService.list('user-1', query())).resolves.toEqual([
        {
          id: 'job-1',
          preset: 'WhatsApp Story',
          status: 'completed',
          createdAt: storedJob.createdAt,
          resultId: 'result-1',
        },
      ]);
    });

    it('meneruskan query pagination/filter ke repository', async () => {
      historyRepository.findJobsForUser.mockResolvedValue([]);
      const historyQuery = query({ page: 3, limit: 5, status: 'failed', platform: 'tiktok' });

      await historyService.list('user-1', historyQuery);

      expect(historyRepository.findJobsForUser).toHaveBeenCalledWith('user-1', historyQuery);
    });
  });

  describe('remove', () => {
    it('menghapus riwayat milik user beserta file output', async () => {
      historyRepository.findJobOwnedByUser.mockResolvedValue(storedJob);

      await expect(historyService.remove('user-1', 'job-1')).resolves.toEqual({ success: true });
      expect(historyRepository.deleteJob).toHaveBeenCalledWith('job-1');
      expect(unlink).toHaveBeenCalledWith(expect.stringContaining('out.mp4'));
    });

    it('melempar NotFoundException untuk riwayat milik user lain', async () => {
      historyRepository.findJobOwnedByUser.mockResolvedValue(null);

      await expect(historyService.remove('user-1', 'job-x')).rejects.toThrow(NotFoundException);
      expect(historyRepository.deleteJob).not.toHaveBeenCalled();
    });

    it('tetap sukses meskipun file output sudah tidak ada', async () => {
      historyRepository.findJobOwnedByUser.mockResolvedValue(storedJob);
      (unlink as jest.Mock).mockRejectedValueOnce(new Error('ENOENT'));

      await expect(historyService.remove('user-1', 'job-1')).resolves.toEqual({ success: true });
    });
  });
});
