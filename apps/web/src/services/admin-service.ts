import { apiRequest } from '@/services/api';
import type {
  AdminDashboardStats,
  AdminJob,
  AdminJobsParams,
  AdminStorageStats,
  AdminUser,
  AdminUsersParams,
} from '@/types/admin';

export function fetchAdminDashboard(): Promise<AdminDashboardStats> {
  return apiRequest<AdminDashboardStats>('/admin/dashboard');
}

export function fetchAdminJobs(params: AdminJobsParams): Promise<AdminJob[]> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.worker) {
    query.set('worker', params.worker);
  }
  if (params.search) {
    query.set('search', params.search);
  }

  return apiRequest<AdminJob[]>(`/admin/jobs?${query.toString()}`);
}

export function fetchAdminStorage(): Promise<AdminStorageStats> {
  return apiRequest<AdminStorageStats>('/admin/storage');
}

export function fetchAdminUsers(params: AdminUsersParams): Promise<AdminUser[]> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));
  if (params.search) {
    query.set('search', params.search);
  }

  return apiRequest<AdminUser[]>(`/admin/users?${query.toString()}`);
}
