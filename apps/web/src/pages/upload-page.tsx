import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { APP_NAME } from '@forkekan/shared';

import { OptimizePanel } from '@/components/optimize-panel';
import { UploadDropzone } from '@/components/upload-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUpload } from '@/hooks/use-upload';

export function UploadPage() {
  const upload = useUpload();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
          <Link
            to="/"
            className="text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {APP_NAME}
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-balance text-2xl font-bold">Upload video</h1>
        <p className="text-pretty mt-2 text-sm text-muted-foreground">
          Unggah video, lihat rekomendasi platform, lalu optimalkan.
        </p>

        <div className="mt-8">
          {upload.status === 'idle' && <UploadDropzone onFileSelected={upload.start} />}

          {upload.status === 'uploading' && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Mengunggah video...</p>
                <p className="text-sm tabular-nums text-muted-foreground">{upload.progress}%</p>
              </div>
              <Progress value={upload.progress} label="Progress upload" className="mt-3" />
              <Button variant="outline" size="sm" className="mt-4" onClick={upload.cancel}>
                Batalkan
              </Button>
            </div>
          )}

          {upload.status === 'success' && upload.result && (
            <div className="space-y-6">
              <div role="status" className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-4">
                <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
                <p className="text-sm font-medium">Video berhasil diunggah</p>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={upload.reset}>
                  Unggah video lain
                </Button>
              </div>
              <OptimizePanel uploadId={upload.result.uploadId} onReset={upload.reset} />
            </div>
          )}

          {upload.status === 'error' && (
            <div role="alert" className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <CircleAlert aria-hidden="true" className="size-5 text-destructive" />
                <p className="font-medium">Upload gagal</p>
              </div>
              <p className="text-pretty mt-2 text-sm text-muted-foreground">
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
          )}
        </div>
      </main>
    </div>
  );
}
