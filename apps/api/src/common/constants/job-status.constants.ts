/**
 * Status job pada API response/query — bentuk lowercase sesuai docs/07
 * (nilai enum database `JobStatus` memakai UPPERCASE).
 */
export const JOB_STATUS_FILTERS = ['waiting', 'processing', 'completed', 'failed'] as const;

export type JobStatusFilter = (typeof JOB_STATUS_FILTERS)[number];
