/** Response endpoint processing — docs/07-api-specification.md. */
export interface ProcessingJobCreated {
  jobId: string;
  status: string;
}

export interface ProcessingStatus {
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  estimatedRemaining: string | null;
}

/** Response GET /processing/{jobId}/result — docs/07. */
export interface ProcessingResultInfo {
  downloadUrl: string;
  thumbnail: string | null;
  size: string;
  resolution: string;
  codec: string;
}
