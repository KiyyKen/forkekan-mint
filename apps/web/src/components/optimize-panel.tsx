import { CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AiFineTuneToggle } from '@/components/ai-fine-tune-toggle';
import { OptimizationResult } from '@/components/optimization-result';
import { PlatformPicker } from '@/components/platform-picker';
import { ProcessingStepper } from '@/components/processing-stepper';
import { Button } from '@/components/ui/button';
import { usePresets } from '@/hooks/use-presets';
import {
  useCreateProcessing,
  useDownloadResult,
  useProcessingResult,
  useProcessingStatus,
} from '@/hooks/use-processing';
import type { AiTuning } from '@/types/processing';

interface OptimizePanelProps {
  uploadId: string;
  onReset: () => void;
}

interface ProcessingContext {
  presetName: string;
}

/** Platform default produk — dipilih otomatis begitu daftar preset dimuat. */
const DEFAULT_PLATFORM_SLUG = 'whatsapp-story';

function PlatformPickerSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat platform"
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

/**
 * Alur setelah upload: pilih Platform Profile (default WhatsApp Story)
 * → (opsional) AI Fine-Tune → progress processing realtime → selesai/gagal.
 */
export function OptimizePanel({ uploadId, onReset }: OptimizePanelProps) {
  const presets = usePresets();
  const createProcessing = useCreateProcessing();
  const jobId = createProcessing.data?.jobId ?? null;
  const processingStatus = useProcessingStatus(jobId);
  const status = processingStatus.data;
  const processingResult = useProcessingResult(jobId, status?.status === 'completed');
  const download = useDownloadResult();
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [aiTuning, setAiTuning] = useState<AiTuning | null>(null);
  const [processingContext, setProcessingContext] = useState<ProcessingContext | null>(null);
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);

  const isBusy = createProcessing.isPending || createProcessing.isSuccess;

  // WhatsApp Story terpilih otomatis begitu daftar preset dimuat, kecuali
  // user sudah memilih platform lain.
  const defaultPresetId =
    presets.data?.find((preset) => preset.slug === DEFAULT_PLATFORM_SLUG)?.id ??
    presets.data?.[0]?.id ??
    '';
  const effectiveSelectedId = selectedPresetId || defaultPresetId;

  // Dibekukan sekali saat status pertama kali terdeteksi "completed", agar
  // waktu proses yang ditampilkan tidak terus bertambah pada render berikutnya.
  useEffect(() => {
    if (status?.status === 'completed' && completedAt === null) {
      setCompletedAt(Date.now());
    }
  }, [status?.status, completedAt]);

  function selectPlatform(presetId: string) {
    setSelectedPresetId(presetId);
    // Tuning lama tidak relevan untuk platform baru — hitung ulang dari nol.
    setAiTuning(null);
  }

  function startProcessing() {
    const preset = presets.data?.find((item) => item.id === effectiveSelectedId);
    if (!preset) {
      return;
    }
    setProcessingContext({ presetName: preset.name });
    setProcessingStartedAt(Date.now());
    setCompletedAt(null);
    createProcessing.mutate({ uploadId, presetId: preset.id, aiTuning: aiTuning ?? undefined });
  }

  const processingTimeSeconds =
    processingStartedAt && completedAt
      ? Math.round((completedAt - processingStartedAt) / 1000)
      : undefined;

  if (createProcessing.isSuccess) {
    return (
      <section aria-label="Progress optimasi">
        {status?.status === 'completed' ? (
          processingResult.data ? (
            <OptimizationResult
              presetName={processingContext?.presetName ?? 'platform pilihan Anda'}
              resolution={processingResult.data.resolution}
              codec={processingResult.data.codec}
              size={processingResult.data.size}
              processingTimeSeconds={processingTimeSeconds}
              isDownloading={download.isPending}
              onDownload={() => jobId && download.mutate(jobId)}
            />
          ) : (
            <div
              role="status"
              aria-label="Menyiapkan hasil"
              className="rounded-xl border-2 border-success/20 bg-success/5 p-6 shadow-sm sm:p-8"
            >
              <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          )
        ) : status?.status === 'failed' ? (
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <CircleAlert aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="font-semibold">Optimasi gagal</p>
                <p className="text-pretty text-sm text-muted-foreground">
                  Terjadi kesalahan saat memproses video Anda. Coba lagi.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <ProcessingStepper status={status} />
          </div>
        )}

        {(status?.status === 'completed' || status?.status === 'failed') && (
          <Button variant="secondary" size="sm" className="mt-4" onClick={onReset}>
            Optimalkan video lain
          </Button>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {presets.isPending && <PlatformPickerSkeleton />}

      {presets.isError && (
        <div role="alert" className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <CircleAlert aria-hidden="true" className="size-5 text-destructive" />
            <p className="font-medium">Daftar platform tidak bisa dimuat</p>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => presets.refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      {presets.isSuccess && (
        <>
          <PlatformPicker
            presets={presets.data}
            selectedPresetId={effectiveSelectedId}
            onSelect={(preset) => selectPlatform(preset.id)}
            disabled={isBusy}
          />

          {effectiveSelectedId && (
            <AiFineTuneToggle
              uploadId={uploadId}
              presetId={effectiveSelectedId}
              onChange={setAiTuning}
              disabled={isBusy}
            />
          )}

          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={isBusy || effectiveSelectedId === ''}
            onClick={startProcessing}
          >
            Optimalkan
          </Button>

          {createProcessing.isError && (
            <p role="alert" className="text-pretty text-sm text-destructive">
              Gagal memulai optimasi: {createProcessing.error.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
