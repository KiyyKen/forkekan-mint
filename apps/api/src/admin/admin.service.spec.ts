import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JobStatus, UserRole } from '@prisma/client';

import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { AdminJobsQueryDto } from './dto/admin-jobs-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

jest.mock('node:fs/promises', () => ({
  statfs: jest.fn(),
}));

import { statfs } from 'node:fs/promises';

describe('AdminService', () => {
  let adminService: AdminService;

  const adminRepository = {
    countUsers: jest.fn(),
    countUploads: jest.fn(),
    countJobs: jest.fn(),
    sumStorageBytes: jest.fn(),
    findJobs: jest.fn(),
    findUsers: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: AdminRepository, useValue: adminRepository },
        {
          provide: ConfigService,
          useValue: { get: (_key: string, fallback: string) => fallback },
        },
      ],
    }).compile();

    adminService = moduleRef.get(AdminService);
  });

  describe('getDashboard', () => {
    it('menggabungkan statistik dan memformat storage sesuai kontrak API', async () => {
      adminRepository.countUsers.mockResolvedValue(120);
      adminRepository.countUploads.mockResolvedValue(985);
      adminRepository.countJobs.mockResolvedValue(963);
      adminRepository.sumStorageBytes.mockResolvedValue(BigInt(18 * 1024 * 1024));

      await expect(adminService.getDashboard()).resolves.toEqual({
        totalUsers: 120,
        totalUploads: 985,
        totalJobs: 963,
        storageUsed: '18 MB',
      });
    });
  });

  describe('getJobs', () => {
    it('memetakan job sesuai kontrak API (jobId, status lowercase, worker)', async () => {
      const createdAt = new Date('2026-07-17T00:00:00Z');
      adminRepository.findJobs.mockResolvedValue([
        {
          id: 'job-1',
          status: JobStatus.PROCESSING,
          workerName: 'worker-1',
          progress: 67,
          createdAt,
          preset: { name: 'WhatsApp Story' },
        },
      ]);

      await expect(adminService.getJobs(new AdminJobsQueryDto())).resolves.toEqual([
        {
          jobId: 'job-1',
          status: 'processing',
          worker: 'worker-1',
          progress: 67,
          preset: 'WhatsApp Story',
          createdAt,
        },
      ]);
    });

    it('meneruskan query filter/pagination ke repository', async () => {
      adminRepository.findJobs.mockResolvedValue([]);
      const query = Object.assign(new AdminJobsQueryDto(), {
        page: 2,
        limit: 5,
        status: 'failed',
        worker: 'worker-1',
      });

      await adminService.getJobs(query);

      expect(adminRepository.findJobs).toHaveBeenCalledWith(query);
    });
  });

  describe('getStorage', () => {
    it('mengembalikan pemakaian tercatat dan sisa kapasitas disk', async () => {
      adminRepository.sumStorageBytes.mockResolvedValue(BigInt(128 * 1024 ** 3));
      (statfs as jest.Mock).mockResolvedValue({ bavail: 872 * 1024 ** 2, bsize: 1024 });

      await expect(adminService.getStorage()).resolves.toEqual({
        used: '128 GB',
        available: '872 GB',
      });
    });

    it('tetap sukses dengan available "unknown" bila statfs gagal', async () => {
      adminRepository.sumStorageBytes.mockResolvedValue(BigInt(0));
      (statfs as jest.Mock).mockRejectedValue(new Error('EACCES'));

      await expect(adminService.getStorage()).resolves.toEqual({
        used: '0 B',
        available: 'unknown',
      });
    });
  });

  describe('getUsers', () => {
    it('memetakan pengguna sesuai kontrak API', async () => {
      const createdAt = new Date('2026-07-17T00:00:00Z');
      adminRepository.findUsers.mockResolvedValue([
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: UserRole.USER,
          createdAt,
        },
      ]);

      await expect(adminService.getUsers(new AdminUsersQueryDto())).resolves.toEqual([
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: UserRole.USER,
          createdAt,
        },
      ]);
    });
  });
});
