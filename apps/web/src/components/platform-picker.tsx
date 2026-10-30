import { Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { PresetSummary } from '@/types/preset';
import { cn } from '@/utils/cn';

interface PlatformPickerProps {
  presets: PresetSummary[];
  selectedPresetId: string;
  onSelect: (preset: PresetSummary) => void;
  disabled?: boolean;
}

/**
 * Platform utama produk — WhatsApp Story tampil pertama dengan badge
 * "Direkomendasikan" dan terpilih secara default. Platform lain tetap
 * didukung penuh, hanya diletakkan di bawah "Platform lainnya" agar tidak
 * bersaing secara visual dengan fokus utama produk.
 */
const PRIMARY_PLATFORM_SLUGS = [
  'whatsapp-story',
  'instagram-story',
  'tiktok',
  'discord',
  'telegram',
  'youtube-shorts',
];

const RECOMMENDED_SLUG = 'whatsapp-story';

interface PlatformCardProps {
  preset: PresetSummary;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function PlatformCard({ preset, isSelected, onSelect, disabled }: PlatformCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/40',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="font-semibold">{preset.name}</span>
        {isSelected && <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />}
      </div>
      {preset.slug === RECOMMENDED_SLUG && (
        <Badge variant="primary" className="mt-1.5">
          Direkomendasikan
        </Badge>
      )}
      <span className="mt-1.5 text-xs tabular-nums text-muted-foreground">{preset.resolution}</span>
      {preset.description && (
        <p className="text-pretty mt-1 text-xs text-muted-foreground">{preset.description}</p>
      )}
    </button>
  );
}

/**
 * Langkah utama alur optimasi — memilih Platform Profile (docs/03: Platform
 * Selection Flow). Menggantikan RecommendationCard sebagai titik masuk
 * utama; AI hanya menyesuaikan parameter pada preset yang dipilih di sini,
 * tidak pernah menggantikannya (lihat AiFineTuneToggle).
 */
export function PlatformPicker({ presets, selectedPresetId, onSelect, disabled }: PlatformPickerProps) {
  const primary = PRIMARY_PLATFORM_SLUGS.map((slug) => presets.find((preset) => preset.slug === slug)).filter(
    (preset): preset is PresetSummary => preset !== undefined,
  );
  const primaryIds = new Set(primary.map((preset) => preset.id));
  const more = presets.filter((preset) => !primaryIds.has(preset.id));

  return (
    <section aria-label="Pilih platform">
      <h2 className="font-semibold">Pilih platform</h2>
      <p className="text-pretty mt-1 text-sm text-muted-foreground">
        WhatsApp Story dioptimalkan untuk kualitas terbaik setelah kompresi ulang WhatsApp.
      </p>

      <div role="radiogroup" aria-label="Platform" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {primary.map((preset) => (
          <PlatformCard
            key={preset.id}
            preset={preset}
            isSelected={preset.id === selectedPresetId}
            onSelect={() => onSelect(preset)}
            disabled={disabled}
          />
        ))}
      </div>

      {more.length > 0 && (
        <details className="mt-4">
          <summary className="w-fit cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Platform lainnya
          </summary>
          <div
            role="radiogroup"
            aria-label="Platform lainnya"
            className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {more.map((preset) => (
              <PlatformCard
                key={preset.id}
                preset={preset}
                isSelected={preset.id === selectedPresetId}
                onSelect={() => onSelect(preset)}
                disabled={disabled}
              />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
