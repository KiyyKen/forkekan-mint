/**
 * Override opsional dari AI Fine-Tune di atas Platform Profile yang dipilih
 * user — hanya 4 parameter ini yang boleh disentuh AI.
 */
export interface AiTuning {
  crf?: number;
  bitrate?: number;
  fps?: number;
  scale?: string;
}

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
