import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiRequest } from '@/services/api';
import { fetchAdminJobs, fetchAdminUsers } from '@/services/admin-service';

vi.mock('@/services/api', () => ({
  apiRequest: vi.fn().mockResolvedValue([]),
}));

const apiRequestMock = vi.mocked(apiRequest);

describe('admin-service', () => {
  beforeEach(() => {
    apiRequestMock.mockClear();
  });

  it('menyusun query GET /admin/jobs lengkap dengan filter', async () => {
    await fetchAdminJobs({
      page: 2,
      limit: 20,
      status: 'processing',
      worker: 'worker-1',
      search: 'whatsapp',
    });

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/admin/jobs?page=2&limit=20&status=processing&worker=worker-1&search=whatsapp',
    );
  });

  it('melewatkan filter kosong pada GET /admin/jobs', async () => {
    await fetchAdminJobs({ page: 1, limit: 20 });

    expect(apiRequestMock).toHaveBeenCalledWith('/admin/jobs?page=1&limit=20');
  });

  it('menyusun query GET /admin/users dengan pencarian', async () => {
    await fetchAdminUsers({ page: 1, limit: 20, search: 'john' });

    expect(apiRequestMock).toHaveBeenCalledWith('/admin/users?page=1&limit=20&search=john');
  });
});
