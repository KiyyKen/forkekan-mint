import { CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

import { OptimizationResult } from '@/components/optimization-result';
import { ProcessingStepper } from '@/components/processing-stepper';
import { RecommendationCard } from '@/components/recommendation-card';
import { Button } from '@/components/ui/button';
import { usePresets } from '@/hooks/use-presets';
import {
  useCreateProcessing,
  useDownloadResult,
  useProcessingResult,
  useProcessingStatus,
} from '@/hooks/use-processing';
import { useRecommendation } from '@/hooks/use-recommendation';

interface OptimizePanelProps {
  uploadId: string;
  onReset: () => void;
}

interface ProcessingContext {
  presetName: string;
  compatibilityScore: number | null;
}

function RecommendationSkeleton() {
  return (
    <div
      role="status"
      aria-label="Menganalisis video"
      className="rounded-xl border-2 border-primary/10 bg-card p-6 sm:p-8"
    >
      <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Menganalisis video Anda...</p>
    </div>
  );
}

/**
 * Alur setelah upload: rekomendasi preset → pilih (rekomendasi/manual)
 * → progress processing realtime → selesai/gagal.
 */
export function OptimizePanel({ uploadId, onReset }: OptimizePanelProps) {
  const recommendation = useRecommendation(uploadId);
  const presets = usePresets();
  const createProcessing = useCreateProcessing();
  const jobId = createProcessing.data?.jobId ?? null;
  const processingStatus = useProcessingStatus(jobId);
  const status = processingStatus.data;
  const processingResult = useProcessingResult(jobId, status?.status === 'completed');
  const download = useDownloadResult();
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [processingContext, setProcessingContext] = useState<ProcessingContext | null>(null);
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);

  const isBusy = createProcessing.isPending || createProcessing.isSuccess;

  // Dibekukan sekali saat status pertama kali terdeteksi "completed", agar
  // waktu proses yang ditampilkan tidak terus bertambah pada render berikutnya.
  useEffect(() => {
    if (status?.status === 'completed' && completedAt === null) {
      setCompletedAt(Date.now());
    }
  }, [status?.status, completedAt]);

  function startProcessing(
    presetId: string,
    presetName: string,
    compatibilityScore: number | null = null,
  ) {
    setProcessingContext({ presetName, compatibilityScore });
    setProcessingStartedAt(Date.now());
    setCompletedAt(null);
    createProcessing.mutate({ uploadId, presetId });
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
              compatibilityScore={processingContext?.compatibilityScore ?? undefined}
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
      {recommendation.isPending && <RecommendationSkeleton />}

      {recommendation.isError && (
        <div role="alert" className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <CircleAlert aria-hidden="true" className="size-5 text-destructive" />
            <p className="font-medium">Analisis belum tersedia</p>
          </div>
          <p className="text-pretty mt-2 text-sm text-muted-foreground">
            Rekomendasi tidak bisa dimuat. Anda tetap bisa memilih preset secara manual di bawah.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => recommendation.refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      {recommendation.isSuccess && (
        <RecommendationCard
          recommendation={recommendation.data}
          presets={presets.data}
          onUse={startProcessing}
          disabled={isBusy}
        />
      )}

      <section aria-label="Pilih preset manual" className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Atau pilih platform sendiri</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Pilih platform tujuan"
            value={selectedPresetId}
            onChange={(event) => setSelectedPresetId(event.target.value)}
            disabled={presets.isPending || isBusy}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
          >
            <option value="">
              {presets.isPending ? 'Memuat preset...' : 'Pilih platform tujuan'}
            </option>
            {presets.data?.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.resolution})
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            disabled={selectedPresetId === '' || isBusy}
            onClick={() => {
              const preset = presets.data?.find((item) => item.id === selectedPresetId);
              if (preset) {
                startProcessing(preset.id, preset.name);
              }
            }}
          >
            Optimalkan
          </Button>
        </div>
        {createProcessing.isError && (
          <p role="alert" className="text-pretty mt-3 text-sm text-destructive">
            Gagal memulai optimasi: {createProcessing.error.message}
          </p>
        )}
      </section>
    </div>
  );
}
