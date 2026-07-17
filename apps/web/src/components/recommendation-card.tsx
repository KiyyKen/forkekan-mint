import { Check, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PresetSummary } from '@/types/preset';
import type { Recommendation } from '@/types/recommendation';

interface RecommendationCardProps {
  recommendation: Recommendation;
  /** Data preset yang sudah dimuat di panel — dipakai hanya untuk menampilkan resolusi target, tidak memicu request baru. */
  presets?: PresetSummary[];
  onUse: (presetId: string, presetName: string, compatibilityScore: number) => void;
  disabled?: boolean;
}

interface ScoreTier {
  label: string;
  className: string;
}

function getScoreTier(score: number): ScoreTier {
  if (score >= 85) {
    return { label: 'Sangat cocok', className: 'bg-success/10 text-success' };
  }
  if (score >= 65) {
    return { label: 'Cocok', className: 'bg-primary/10 text-primary' };
  }
  if (score >= 45) {
    return { label: 'Cukup cocok', className: 'bg-warning/10 text-warning' };
  }
  return { label: 'Kurang cocok', className: 'bg-muted text-muted-foreground' };
}

/** Memecah kalimat alasan AI menjadi poin — reason selalu berupa kalimat pendek berurutan. */
function splitReasonIntoPoints(reason: string): string[] {
  return reason
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/**
 * Kartu rekomendasi AI — preset terbaik harus mendominasi halaman,
 * alasan disajikan sebagai poin (bukan paragraf), alternatif tetap
 * terlihat tapi visualnya sekunder (docs/09: Badge — AI Recommendation).
 */
export function RecommendationCard({
  recommendation,
  presets,
  onUse,
  disabled,
}: RecommendationCardProps) {
  const { compatibilityScore, recommendedPreset, reason, alternatives } = recommendation;
  const tier = getScoreTier(compatibilityScore);
  const reasonPoints = splitReasonIntoPoints(reason);
  const targetResolution = presets?.find((preset) => preset.id === recommendedPreset.id)
    ?.resolution;

  return (
    <section
      aria-label="Rekomendasi preset"
      className="rounded-xl border-2 border-primary/20 bg-card p-6 sm:p-8"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles aria-hidden="true" className="size-4" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
          Rekomendasi AI
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-balance text-2xl font-bold">{recommendedPreset.name}</h2>
          {targetResolution && (
            <p className="mt-1 text-sm text-muted-foreground">Target resolusi {targetResolution}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold tabular-nums text-primary">
            {compatibilityScore}%
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tier.className}`}>
            {tier.label}
          </span>
        </div>
      </div>

      {reasonPoints.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Kenapa preset ini?
          </p>
          <ul className="mt-2 space-y-1.5">
            {reasonPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-pretty">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        size="lg"
        className="mt-6 w-full sm:w-auto"
        disabled={disabled}
        onClick={() => onUse(recommendedPreset.id, recommendedPreset.name, compatibilityScore)}
      >
        <Sparkles aria-hidden="true" className="size-4" />
        Gunakan rekomendasi
      </Button>

      {alternatives.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Alternatif lain
          </p>
          <ul className="mt-2 space-y-2">
            {alternatives.map((alternative) => (
              <li
                key={alternative.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm">
                  {alternative.name}{' '}
                  <span className="tabular-nums text-muted-foreground">
                    ({alternative.compatibilityScore}%)
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() =>
                    onUse(alternative.id, alternative.name, alternative.compatibilityScore)
                  }
                >
                  Pilih
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
