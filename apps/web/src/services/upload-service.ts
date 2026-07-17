import { ApiError } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export interface UploadResult {
  uploadId: string;
  status: string;
}

export interface UploadHandle {
  promise: Promise<UploadResult>;
  /** Membatalkan upload yang sedang berjalan (PRD: Cancel Upload). */
  abort: () => void;
}

export class UploadCancelledError extends Error {
  constructor() {
    super('Upload dibatalkan');
    this.name = 'UploadCancelledError';
  }
}

/**
 * POST /uploads (multipart, field "video") — docs/07-api-specification.md.
 * Memakai XMLHttpRequest karena fetch belum mendukung progress upload.
 */
export function uploadVideo(file: File, onProgress: (percent: number) => void): UploadHandle {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<UploadResult>((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText) as unknown;
      } catch {
        body = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as UploadResult);
        return;
      }

      const message =
        (body as { message?: string } | null)?.message ?? `Upload gagal (${xhr.status})`;
      reject(new ApiError(xhr.status, message));
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError(0, 'Tidak dapat terhubung ke server'));
    });

    xhr.addEventListener('abort', () => {
      reject(new UploadCancelledError());
    });

    xhr.open('POST', `${API_URL}/uploads`);

    const token = useAuthStore.getState().token;
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    const formData = new FormData();
    formData.append('video', file);
    xhr.send(formData);
  });

  return { promise, abort: () => xhr.abort() };
}
