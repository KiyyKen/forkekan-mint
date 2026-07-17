import { Button } from '@/components/ui/button';
import { usePresets } from '@/hooks/use-presets';

/**
 * Daftar preset platform (GET /presets).
 * Read-only: docs/07 tidak mendefinisikan endpoint pengelolaan preset —
 * perubahan preset dilakukan melalui seed database sesuai blueprint.
 */
export function AdminPresetsPage() {
  const presets = usePresets();

  return (
    <>
      <h1 className="text-balance text-2xl font-bold">Preset platform</h1>
      <p className="text-pretty mt-2 text-sm text-muted-foreground">
        Preset optimasi yang tersedia untuk pengguna. Perubahan dilakukan melalui seed database.
      </p>

      <div className="mt-8">
        {presets.isPending && (
          <div role="status" aria-label="Memuat preset" className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {presets.isError && (
          <div role="alert" className="rounded-xl border border-border bg-card p-6">
            <p className="font-medium">Daftar preset tidak dapat dimuat</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => presets.refetch()}>
              Coba lagi
            </Button>
          </div>
        )}

        {presets.isSuccess && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-120 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="px-6 py-3 font-medium">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Resolusi target
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {presets.data.map((preset) => (
                  <tr key={preset.id}>
                    <td className="px-6 py-3 font-medium">{preset.name}</td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                      {preset.slug}
                    </td>
                    <td className="px-6 py-3 tabular-nums text-muted-foreground">
                      {preset.resolution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
