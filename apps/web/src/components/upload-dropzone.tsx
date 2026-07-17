import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import {
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_UPLOAD_SIZE_MB,
  VIDEO_FILE_ACCEPT,
} from '@/utils/validate-video-file';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
}

/**
 * Area drag & drop + file picker (PRD: Upload Video).
 * Satu video per proses optimasi pada MVP.
 */
export function UploadDropzone({ onFileSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);

    const file = event.dataTransfer.files.item(0);
    if (file) {
      onFileSelected(file);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragActive(false)}
      className={cn(
        'flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed border-border bg-card px-6 py-20 text-center transition-colors',
        isDragActive && 'border-primary bg-primary/5',
      )}
    >
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform',
          isDragActive && 'scale-110',
        )}
      >
        <UploadCloud aria-hidden="true" className="size-6" />
      </span>

      <div>
        <p className="text-pretty text-lg font-semibold">Tarik dan letakkan video di sini</p>
        <p className="text-pretty mt-1 text-sm text-muted-foreground">
          atau klik tombol di bawah untuk memilih dari perangkat Anda
        </p>
      </div>

      <Button size="lg" onClick={() => inputRef.current?.click()}>
        Pilih video
      </Button>

      <div className="flex flex-col items-center gap-2">
        <ul className="flex flex-wrap items-center justify-center gap-1.5">
          {ALLOWED_VIDEO_EXTENSIONS.map((extension) => (
            <li
              key={extension}
              className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground uppercase"
            >
              {extension.replace('.', '')}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Maksimal {MAX_UPLOAD_SIZE_MB} MB per video</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_FILE_ACCEPT}
        className="sr-only"
        aria-label="Pilih file video"
        onChange={(event) => {
          const file = event.target.files?.item(0);
          if (file) {
            onFileSelected(file);
          }
          event.target.value = '';
        }}
      />
    </div>
  );
}
