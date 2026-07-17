import { CheckCircle2, CircleAlert, Download, Sparkles, UploadCloud } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AppHeader } from '@/components/app-header';
import { OptimizePanel } from '@/components/optimize-panel';
import { UploadDropzone } from '@/components/upload-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUpload } from '@/hooks/use-upload';
import { formatFileSize } from '@/utils/format-file-size';

interface NextStep {
  icon: LucideIcon;
  label: string;
}

const NEXT_STEPS: NextStep[] = [
  { icon: UploadCloud, label: 'Upload' },
  { icon: Sparkles, label: 'AI menganalisis' },
  { icon: Download, label: 'Pilih & download' },
];

/** Strip mini "apa yang terjadi setelah upload" — hanya tampil sebelum ada file. */
function NextStepsPreview() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
      {NEXT_STEPS.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden="true" className="text-muted-foreground">→</span>}
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <step.icon aria-hidden="true" className="size-3.5" />
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function UploadPage() {
  const upload = useUpload();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-balance text-4xl font-bold tracking-tight">Upload video</h1>
        <p className="text-pretty mt-2 text-muted-foreground">
          Upload video Anda, dapatkan rekomendasi platform dari AI, dan unduh hasilnya.
        </p>

        <div className="mt-8">
          {upload.status === 'idle' && (
            <>
              <UploadDropzone onFileSelected={upload.start} />
              <NextStepsPreview />
            </>
          )}

          {upload.status === 'uploading' && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-medium">
                      {upload.file?.name ?? 'Mengunggah video...'}
                    </p>
                    <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {upload.progress}%
                    </p>
                  </div>
                  {upload.file && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFileSize(upload.file.size)}
                    </p>
                  )}
                  <Progress value={upload.progress} label="Progress upload" className="mt-3" />
                  <Button variant="outline" size="sm" className="mt-4" onClick={upload.cancel}>
                    Batalkan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {upload.status === 'success' && upload.result && (
            <div className="space-y-4">
              <div
                role="status"
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Video berhasil diunggah</p>
                  {upload.file && (
                    <p className="truncate text-xs text-muted-foreground">{upload.file.name}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={upload.reset}>
                  Unggah video lain
                </Button>
              </div>
              <OptimizePanel uploadId={upload.result.uploadId} onReset={upload.reset} />
            </div>
          )}

          {upload.status === 'error' && (
            <div role="alert" className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <CircleAlert aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Upload gagal</p>
                  <p className="text-pretty mt-1 text-sm text-muted-foreground">
                    {upload.errorMessage}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={upload.retry}>
                      Coba lagi
                    </Button>
                    <Button variant="outline" size="sm" onClick={upload.reset}>
                      Pilih video lain
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
