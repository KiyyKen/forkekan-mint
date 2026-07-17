import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { useAdminUsers } from '@/hooks/use-admin';
import type { AdminUsersParams } from '@/types/admin';
import { formatDate } from '@/utils/format-date';

const PAGE_SIZE = 20;

const DEFAULT_PARAMS: AdminUsersParams = {
  page: 1,
  limit: PAGE_SIZE,
};

const INPUT_CLASS =
  'h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Daftar pengguna terdaftar (GET /admin/users). */
export function AdminUsersPage() {
  const [params, setParams] = useState<AdminUsersParams>(DEFAULT_PARAMS);
  const [searchInput, setSearchInput] = useState('');

  const users = useAdminUsers(params);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setParams((previous) => ({
      ...previous,
      search: searchInput.trim() || undefined,
      page: 1,
    }));
  }

  const items = users.data ?? [];
  const hasNextPage = items.length === params.limit;

  return (
    <>
      <h1 className="text-balance text-2xl font-bold">Pengguna</h1>
      <p className="text-pretty mt-2 text-sm text-muted-foreground">
        Seluruh akun yang pernah masuk melalui Google.
      </p>

      <form onSubmit={handleSearch} className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          aria-label="Cari pengguna"
          placeholder="Cari nama atau email..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className={`${INPUT_CLASS} w-full sm:w-64`}
        />
        <Button type="submit" variant="secondary" size="md">
          Cari
        </Button>
      </form>

      <div className="mt-6">
        {users.isPending && (
          <div role="status" aria-label="Memuat pengguna" className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {users.isError && (
          <div role="alert" className="rounded-xl border border-border bg-card p-6">
            <p className="font-medium">Daftar pengguna tidak bisa dimuat</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => users.refetch()}>
              Coba lagi
            </Button>
          </div>
        )}

        {users.isSuccess && items.length === 0 && (
          <div role="status" className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="font-medium">Tidak ada pengguna yang cocok.</p>
            <p className="text-pretty mt-1 text-sm text-muted-foreground">
              Ubah kata kunci pencarian untuk melihat pengguna lain.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-140 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="px-6 py-3 font-medium">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Terdaftar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-3 font-medium">{user.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {user.role === 'ADMIN' ? 'Admin' : 'Pengguna'}
                      </span>
                    </td>
                    <td className="px-6 py-3 tabular-nums text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(params.page > 1 || hasNextPage) && (
        <nav aria-label="Navigasi halaman" className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={params.page <= 1 || users.isPending}
            onClick={() => setParams((previous) => ({ ...previous, page: previous.page - 1 }))}
          >
            Sebelumnya
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">Halaman {params.page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || users.isPending}
            onClick={() => setParams((previous) => ({ ...previous, page: previous.page + 1 }))}
          >
            Berikutnya
          </Button>
        </nav>
      )}
    </>
  );
}
