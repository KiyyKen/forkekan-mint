import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Recommendation } from '@/types/recommendation';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onUse: (presetId: string) => void;
  disabled?: boolean;
}

/**
 * Kartu rekomendasi preset (docs/09: Badge — AI Recommendation).
 */
export function RecommendationCard({ recommendation, onUse, disabled }: RecommendationCardProps) {
  const { compatibilityScore, recommendedPreset, reason, alternatives } = recommendation;

  return (
    <section
      aria-label="Rekomendasi preset"
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-5 text-primary" />
          <h2 className="font-semibold">Rekomendasi untuk video ini</h2>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold tabular-nums text-primary">
          {compatibilityScore}% cocok
        </span>
      </div>

      <p className="mt-4 text-lg font-bold">{recommendedPreset.name}</p>
      <p className="text-pretty mt-1 text-sm text-muted-foreground">{reason}</p>

      <Button className="mt-4" disabled={disabled} onClick={() => onUse(recommendedPreset.id)}>
        Gunakan rekomendasi
      </Button>

      {alternatives.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="text-sm font-medium text-muted-foreground">Alternatif lain</h3>
          <ul className="mt-2 space-y-2">
            {alternatives.map((alternative) => (
              <li key={alternative.id} className="flex items-center justify-between gap-4">
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
                  onClick={() => onUse(alternative.id)}
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
