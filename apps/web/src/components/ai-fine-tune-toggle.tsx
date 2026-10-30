import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAiFineTune } from '@/hooks/use-ai-fine-tune';
import type { AiTuning } from '@/types/processing';
import { cn } from '@/utils/cn';

interface AiFineTuneToggleProps {
  uploadId: string;
  presetId: string;
  /** Dipanggil dengan tuning aktif, atau null saat toggle nonaktif/direset. */
  onChange: (tuning: AiTuning | null) => void;
  disabled?: boolean;
}

function summarizeTuning(tuning: AiTuning): string {
  const parts: string[] = [];
  if (tuning.crf !== undefined) {
    parts.push(`CRF ${tuning.crf}`);
  }
  if (tuning.fps !== undefined) {
    parts.push(`${tuning.fps}fps`);
  }
  if (tuning.bitrate !== undefined) {
    parts.push(`${tuning.bitrate} kbps`);
  }
  if (tuning.scale !== undefined) {
    parts.push(tuning.scale);
  }
  return parts.join(' · ');
}

/**
 * Langkah opsional AI Fine-Tune — hanya menyesuaikan CRF/bitrate/fps/scale
 * di atas Platform Profile yang sudah dipilih (docs/03: AI Flow). Tidak ada
 * slider mentah: AI menghitung nilainya sendiri, pengguna cukup
 * menyalakan/mematikan toggle ini.
 */
export function AiFineTuneToggle({ uploadId, presetId, onChange, disabled }: AiFineTuneToggleProps) {
  const [isOn, setIsOn] = useState(false);
  const suggestion = useAiFineTune(uploadId, presetId, isOn);

  useEffect(() => {
    if (!isOn) {
      onChange(null);
      return;
    }
    if (suggestion.data) {
      onChange({
        crf: suggestion.data.suggestedCrf,
        bitrate: suggestion.data.suggestedBitrate,
        fps: suggestion.data.suggestedFps,
        scale: suggestion.data.suggestedScale,
      });
    }
  }, [isOn, suggestion.data, onChange]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">AI Fine-Tune</p>
            <p className="text-pretty text-xs text-muted-foreground">
              Sesuaikan otomatis CRF, bitrate, fps, dan scale — opsional.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Aktifkan AI Fine-Tune"
          disabled={disabled}
          onClick={() => setIsOn((value) => !value)}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            isOn ? 'bg-primary' : 'bg-input',
            disabled && 'opacity-50',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-0.5 left-0.5 size-5 rounded-full bg-background transition-transform',
              isOn && 'translate-x-5',
            )}
          />
        </button>
      </div>

      {isOn && (
        <div className="mt-3 border-t border-border pt-3">
          {suggestion.isPending && (
            <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              Menganalisis video...
            </p>
          )}

          {suggestion.isError && (
            <p className="text-pretty text-xs text-muted-foreground">
              AI Fine-Tune tidak tersedia saat ini — preset default platform tetap dipakai.
            </p>
          )}

          {suggestion.isSuccess && (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="text-pretty text-xs text-muted-foreground">
                <span className="font-medium text-foreground">AI menyesuaikan: </span>
                {summarizeTuning({
                  crf: suggestion.data.suggestedCrf,
                  bitrate: suggestion.data.suggestedBitrate,
                  fps: suggestion.data.suggestedFps,
                  scale: suggestion.data.suggestedScale,
                }) || 'tidak ada perubahan diperlukan'}
                {' — '}
                {suggestion.data.reason}
              </p>
              <button
                type="button"
                onClick={() => setIsOn(false)}
                className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Reset ke default platform
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
