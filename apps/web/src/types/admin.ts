import type { UserRole } from '@/types/auth';
import type { ProcessingStatus } from '@/types/processing';

/** Response GET /admin/dashboard — docs/07. */
export interface AdminDashboardStats {
  totalUsers: number;
  totalUploads: number;
  totalJobs: number;
  storageUsed: string;
}

/** Item GET /admin/jobs — docs/07 (`preset` & `createdAt` adalah field aditif). */
export interface AdminJob {
  jobId: string;
  status: ProcessingStatus['status'];
  worker: string | null;
  progress: number;
  preset: string;
  createdAt: string;
}

export interface AdminJobsParams {
  page: number;
  limit: number;
  status?: string;
  worker?: string;
  search?: string;
}

/** Response GET /admin/storage — docs/07. */
export interface AdminStorageStats {
  used: string;
  available: string;
}

/** Item GET /admin/users — docs/07 (`role` & `createdAt` adalah field aditif). */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminUsersParams {
  page: number;
  limit: number;
  search?: string;
}
