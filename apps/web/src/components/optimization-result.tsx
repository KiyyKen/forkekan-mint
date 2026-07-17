import { CheckCircle2, Clock, Download, FileVideo, HardDrive, Maximize2, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface OptimizationResultProps {
  presetName: string;
  resolution: string;
  codec: string;
  size: string;
  /** Hanya tersedia bila video diproses lewat rekomendasi AI pada sesi ini — tidak ada di riwayat lama. */
  compatibilityScore?: number;
  /** Estimasi client-side (job dibuat → selesai terdeteksi) — hanya tersedia pada sesi optimasi langsung. */
  processingTimeSeconds?: number;
  onDownload: () => void;
  isDownloading: boolean;
}

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function StatTile({ icon: Icon, label, value }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon aria-hidden="true" className="size-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} detik`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

/**
 * Layar "reward" hasil optimasi — dipakai bersama di alur setelah processing
 * (optimize-panel) dan dialog detail riwayat, agar tidak ada UI hasil yang
 * terduplikasi. Hanya menampilkan data yang benar-benar tersedia dari
 * GET /processing/{jobId}/result — tidak ada nilai yang dikarang.
 */
export function OptimizationResult({
  presetName,
  resolution,
  codec,
  size,
  compatibilityScore,
  processingTimeSeconds,
  onDownload,
  isDownloading,
}: OptimizationResultProps) {
  return (
    <div className="rounded-xl border-2 border-success/30 bg-success/5 p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="text-xl font-bold">Optimasi selesai</p>
          <p className="text-pretty text-sm text-muted-foreground">
            Video Anda siap untuk {presetName}.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={Maximize2} label="Resolusi" value={resolution} />
        <StatTile icon={FileVideo} label="Codec" value={codec.toUpperCase()} />
        <StatTile icon={HardDrive} label="Ukuran" value={size} />
        {compatibilityScore !== undefined && (
          <StatTile icon={Sparkles} label="Kompatibilitas" value={`${compatibilityScore}%`} />
        )}
        {processingTimeSeconds !== undefined && (
          <StatTile icon={Clock} label="Waktu proses" value={formatDuration(processingTimeSeconds)} />
        )}
      </dl>

      <Button
        size="lg"
        className="mt-6 h-12 w-full text-base font-semibold"
        disabled={isDownloading}
        onClick={onDownload}
      >
        <Download aria-hidden="true" className="size-5" />
        {isDownloading ? 'Menyiapkan...' : 'Download video'}
      </Button>
    </div>
  );
}
