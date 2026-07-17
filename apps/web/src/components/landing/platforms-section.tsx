import { usePresets } from '@/hooks/use-presets';

/**
 * Nama preset selalu berbentuk "{Platform} {Varian}" (mis. "WhatsApp Story",
 * "WhatsApp Chat") — diringkas ke nama platform saja agar baris ini jadi
 * trust-signal cepat dibaca, bukan daftar preset lengkap.
 */
function platformFamily(presetName: string): string {
  return presetName.split(' ')[0];
}

/** Platform yang didukung — data asli dari GET /presets, bukan daftar statis. */
export function PlatformsSection() {
  const presets = usePresets();

  if (presets.isPending) {
    return (
      <section aria-label="Platform yang didukung" className="border-y border-border bg-card/50">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-3 px-6 py-8">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="h-8 w-24 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  if (presets.isError || !presets.data || presets.data.length === 0) {
    return null;
  }

  const platforms = Array.from(new Set(presets.data.map((preset) => platformFamily(preset.name))));

  return (
    <section aria-label="Platform yang didukung" className="border-y border-border bg-card/50">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-6 py-8">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Siap pakai untuk
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {platforms.map((platform) => (
            <li
              key={platform}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium"
            >
              {platform}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
