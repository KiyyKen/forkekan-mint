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
