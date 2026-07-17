import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { MAX_UPLOAD_SIZE_MB, VIDEO_FILE_ACCEPT } from '@/utils/validate-video-file';

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
        'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-card px-6 py-16 text-center',
        isDragActive && 'border-primary bg-accent',
      )}
    >
      <UploadCloud aria-hidden="true" className="size-10 text-muted-foreground" />

      <div>
        <p className="text-pretty font-medium">Tarik dan letakkan video di sini</p>
        <p className="text-pretty mt-1 text-sm text-muted-foreground">
          MP4, MOV, AVI, MKV, atau WEBM — maksimal {MAX_UPLOAD_SIZE_MB} MB.
        </p>
      </div>

      <Button onClick={() => inputRef.current?.click()}>Pilih video</Button>

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
