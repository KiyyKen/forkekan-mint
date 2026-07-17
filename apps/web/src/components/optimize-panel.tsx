import { CheckCircle2, CircleAlert, Download } from 'lucide-react';
import { useState } from 'react';

import { RecommendationCard } from '@/components/recommendation-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePresets } from '@/hooks/use-presets';
import {
  useCreateProcessing,
  useDownloadResult,
  useProcessingStatus,
} from '@/hooks/use-processing';
import { useRecommendation } from '@/hooks/use-recommendation';

interface OptimizePanelProps {
  uploadId: string;
  onReset: () => void;
}

function RecommendationSkeleton() {
  return (
    <div role="status" aria-label="Menganalisis video" className="rounded-xl border border-border bg-card p-6">
      <div className="h-5 w-56 animate-pulse rounded-md bg-muted" />
      <div className="mt-4 h-6 w-40 animate-pulse rounded-md bg-muted" />
      <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-muted" />
      <p className="mt-4 text-sm text-muted-foreground">Menganalisis metadata video...</p>
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
  const processingStatus = useProcessingStatus(createProcessing.data?.jobId ?? null);
  const download = useDownloadResult();
  const [selectedPresetId, setSelectedPresetId] = useState('');

  const isBusy = createProcessing.isPending || createProcessing.isSuccess;

  function startProcessing(presetId: string) {
    createProcessing.mutate({ uploadId, presetId });
  }

  const status = processingStatus.data;

  if (createProcessing.isSuccess) {
    return (
      <section aria-label="Progress optimasi" className="rounded-xl border border-border bg-card p-6">
        {status?.status === 'completed' ? (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
              <p className="font-medium">Optimasi selesai</p>
            </div>
            <p className="text-pretty mt-2 text-sm text-muted-foreground">Video siap diunduh.</p>
            <Button
              className="mt-4"
              disabled={download.isPending}
              onClick={() => {
                if (createProcessing.data) {
                  download.mutate(createProcessing.data.jobId);
                }
              }}
            >
              <Download aria-hidden="true" className="size-4" />
              {download.isPending ? 'Menyiapkan...' : 'Download video'}
            </Button>
          </>
        ) : status?.status === 'failed' ? (
          <>
            <div className="flex items-center gap-2">
              <CircleAlert aria-hidden="true" className="size-5 text-destructive" />
              <p className="font-medium">Optimasi gagal</p>
            </div>
            <p className="text-pretty mt-2 text-sm text-muted-foreground">
              Terjadi kesalahan saat memproses video. Silakan coba lagi.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{status?.currentStep ?? 'Waiting'}...</p>
              <p className="text-sm tabular-nums text-muted-foreground">
                {status?.progress ?? 0}%
                {status?.estimatedRemaining ? ` · sisa ${status.estimatedRemaining}` : ''}
              </p>
            </div>
            <Progress value={status?.progress ?? 0} label="Progress optimasi" className="mt-3" />
          </>
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
            Rekomendasi tidak dapat dimuat. Anda tetap bisa memilih preset secara manual di bawah.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => recommendation.refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      {recommendation.isSuccess && (
        <RecommendationCard
          recommendation={recommendation.data}
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
            onClick={() => startProcessing(selectedPresetId)}
          >
            Optimalkan
          </Button>
        </div>
        {createProcessing.isError && (
          <p role="alert" className="text-pretty mt-3 text-sm text-destructive">
            Gagal membuat job optimasi: {createProcessing.error.message}
          </p>
        )}
      </section>
    </div>
  );
}
