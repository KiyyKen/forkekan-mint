import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { statfs } from 'node:fs/promises';
import path from 'node:path';

import { humanFileSize } from '../common/utils/human-file-size';
import { DEFAULT_UPLOAD_DIR } from '../uploads/uploads.constants';
import { AdminRepository } from './admin.repository';
import { AdminJobsQueryDto } from './dto/admin-jobs-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

/** Response GET /admin/dashboard — docs/07. */
export interface AdminDashboardStats {
  totalUsers: number;
  totalUploads: number;
  totalJobs: number;
  storageUsed: string;
}

/** Item response GET /admin/jobs — docs/07. `preset` & `createdAt` aditif untuk UI monitor. */
export interface AdminJobItem {
  jobId: string;
  status: string;
  worker: string | null;
  progress: number;
  preset: string;
  createdAt: Date;
}

/** Response GET /admin/storage — docs/07. */
export interface AdminStorageStats {
  used: string;
  available: string;
}

/** Item response GET /admin/users — docs/07. `role` & `createdAt` aditif untuk UI manajemen. */
export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

/** Ditampilkan bila kapasitas disk tidak dapat dibaca (statfs gagal). */
const AVAILABLE_UNKNOWN = 'unknown';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly storageDir: string;

  constructor(
    private readonly adminRepository: AdminRepository,
    configService: ConfigService,
  ) {
    this.storageDir = path.resolve(configService.get<string>('UPLOAD_DIR', DEFAULT_UPLOAD_DIR));
  }

  /** Statistik ringkas sistem (GET /admin/dashboard). */
  async getDashboard(): Promise<AdminDashboardStats> {
    const [totalUsers, totalUploads, totalJobs, storageBytes] = await Promise.all([
      this.adminRepository.countUsers(),
      this.adminRepository.countUploads(),
      this.adminRepository.countJobs(),
      this.adminRepository.sumStorageBytes(),
    ]);

    return {
      totalUsers,
      totalUploads,
      totalJobs,
      storageUsed: humanFileSize(Number(storageBytes)),
    };
  }

  /** Seluruh processing job lintas user (GET /admin/jobs). */
  async getJobs(query: AdminJobsQueryDto): Promise<AdminJobItem[]> {
    const jobs = await this.adminRepository.findJobs(query);

    return jobs.map((job) => ({
      jobId: job.id,
      status: job.status.toLowerCase(),
      worker: job.workerName,
      progress: job.progress,
      preset: job.preset.name,
      createdAt: job.createdAt,
    }));
  }

  /** Pemakaian storage tercatat + sisa kapasitas disk (GET /admin/storage). */
  async getStorage(): Promise<AdminStorageStats> {
    const usedBytes = await this.adminRepository.sumStorageBytes();

    let available = AVAILABLE_UNKNOWN;
    try {
      const stats = await statfs(this.storageDir);
      available = humanFileSize(stats.bavail * stats.bsize);
    } catch (error) {
      this.logger.warn(
        `Gagal membaca kapasitas disk ${this.storageDir}: ${(error as Error).message}`,
      );
    }

    return {
      used: humanFileSize(Number(usedBytes)),
      available,
    };
  }

  /** Daftar pengguna (GET /admin/users). */
  async getUsers(query: AdminUsersQueryDto): Promise<AdminUserItem[]> {
    const users = await this.adminRepository.findUsers(query);

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));
  }
}
