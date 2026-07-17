import { useCallback, useRef, useState } from 'react';

import {
  UploadCancelledError,
  uploadVideo,
  type UploadHandle,
  type UploadResult,
} from '@/services/upload-service';
import { validateVideoFile } from '@/utils/validate-video-file';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadState {
  status: UploadStatus;
  progress: number;
  result: UploadResult | null;
  errorMessage: string | null;
}

const IDLE_STATE: UploadState = {
  status: 'idle',
  progress: 0,
  result: null,
  errorMessage: null,
};

/**
 * State machine upload: idle → uploading → success/error,
 * dengan dukungan cancel dan retry (PRD: Upload Video).
 */
export function useUpload() {
  const [state, setState] = useState<UploadState>(IDLE_STATE);
  const handleRef = useRef<UploadHandle | null>(null);
  const lastFileRef = useRef<File | null>(null);

  const start = useCallback((file: File) => {
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setState({ status: 'error', progress: 0, result: null, errorMessage: validation.reason });
      return;
    }

    lastFileRef.current = file;
    setState({ status: 'uploading', progress: 0, result: null, errorMessage: null });

    const handle = uploadVideo(file, (percent) => {
      setState((previous) => ({ ...previous, progress: percent }));
    });
    handleRef.current = handle;

    handle.promise
      .then((result) => {
        setState({ status: 'success', progress: 100, result, errorMessage: null });
      })
      .catch((error: Error) => {
        if (error instanceof UploadCancelledError) {
          setState(IDLE_STATE);
          return;
        }
        setState({ status: 'error', progress: 0, result: null, errorMessage: error.message });
      })
      .finally(() => {
        handleRef.current = null;
      });
  }, []);

  const cancel = useCallback(() => {
    handleRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    if (lastFileRef.current) {
      start(lastFileRef.current);
    }
  }, [start]);

  const reset = useCallback(() => {
    handleRef.current?.abort();
    lastFileRef.current = null;
    setState(IDLE_STATE);
  }, []);

  return { ...state, start, cancel, retry, reset };
}
