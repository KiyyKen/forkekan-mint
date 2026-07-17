/**
 * Nama job pada queue video-processing.
 * Nama yang sama dipakai producer di apps/api (uploads.constants.ts);
 * jaga keduanya tetap sinkron.
 */
export const EXTRACT_METADATA_JOB = 'extract-metadata';

export interface ExtractMetadataJobData {
  mediaFileId: string;
  /** Path absolut file video pada disk lokal. */
  filePath: string;
}

export const PROCESS_VIDEO_JOB = 'process-video';

export interface ProcessVideoJobData {
  processingJobId: string;
  /** Path absolut file input pada disk lokal. */
  inputPath: string;
  /** Direktori absolut untuk file hasil encoding. */
  outputDir: string;
}
