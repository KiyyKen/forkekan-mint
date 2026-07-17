import { apiRequest } from '@/services/api';
import type { ProcessingJobCreated, ProcessingResultInfo, ProcessingStatus } from '@/types/processing';

export function createProcessingJob(
  uploadId: string,
  presetId: string,
): Promise<ProcessingJobCreated> {
  return apiRequest<ProcessingJobCreated>('/processing', {
    method: 'POST',
    body: { uploadId, presetId },
  });
}

export function fetchProcessingStatus(jobId: string): Promise<ProcessingStatus> {
  return apiRequest<ProcessingStatus>(`/processing/${jobId}`);
}

export function fetchProcessingResult(jobId: string): Promise<ProcessingResultInfo> {
  return apiRequest<ProcessingResultInfo>(`/processing/${jobId}/result`);
}
