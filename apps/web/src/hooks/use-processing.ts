import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createProcessingJob,
  fetchProcessingResult,
  fetchProcessingStatus,
} from '@/services/processing-service';

const STATUS_POLL_INTERVAL_MS = 1_000;

export function useCreateProcessing() {
  return useMutation({
    mutationFn: ({ uploadId, presetId }: { uploadId: string; presetId: string }) =>
      createProcessingJob(uploadId, presetId),
  });
}

/** Detail hasil optimasi (GET /processing/{jobId}/result). */
export function useProcessingResult(jobId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['processing-result', jobId],
    queryFn: () => fetchProcessingResult(jobId as string),
    enabled: jobId !== null && enabled,
  });
}

/**
 * Memulai download: minta URL hasil lalu arahkan browser ke signed URL.
 */
export function useDownloadResult() {
  return useMutation({
    mutationFn: fetchProcessingResult,
    onSuccess: (result) => {
      window.location.assign(result.downloadUrl);
    },
  });
}

/**
 * Status processing dengan polling 1 detik sampai selesai/gagal
 * (PRD: Realtime Progress).
 */
export function useProcessingStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['processing', jobId],
    queryFn: () => fetchProcessingStatus(jobId as string),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : STATUS_POLL_INTERVAL_MS;
    },
  });
}
