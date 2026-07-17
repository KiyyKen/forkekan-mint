import { useQuery } from '@tanstack/react-query';

import {
  fetchAdminDashboard,
  fetchAdminJobs,
  fetchAdminStorage,
  fetchAdminUsers,
} from '@/services/admin-service';
import type { AdminJobsParams, AdminUsersParams } from '@/types/admin';

const ADMIN_QUERY_KEY = 'admin';

/** Statistik & storage cukup di-refresh berkala; queue monitor lebih sering. */
const STATS_REFETCH_INTERVAL_MS = 15_000;
const JOBS_REFETCH_INTERVAL_MS = 5_000;

export function useAdminDashboard() {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'dashboard'],
    queryFn: fetchAdminDashboard,
    refetchInterval: STATS_REFETCH_INTERVAL_MS,
  });
}

export function useAdminJobs(params: AdminJobsParams) {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'jobs', params],
    queryFn: () => fetchAdminJobs(params),
    refetchInterval: JOBS_REFETCH_INTERVAL_MS,
  });
}

export function useAdminStorage() {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'storage'],
    queryFn: fetchAdminStorage,
    refetchInterval: STATS_REFETCH_INTERVAL_MS,
  });
}

export function useAdminUsers(params: AdminUsersParams) {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'users', params],
    queryFn: () => fetchAdminUsers(params),
  });
}
