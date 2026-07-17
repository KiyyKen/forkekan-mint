import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { JOB_STATUS_FILTERS, JobStatusFilter } from '../../common/constants/job-status.constants';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/** Query GET /admin/jobs — docs/07-api-specification.md. */
export class AdminJobsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsIn(JOB_STATUS_FILTERS)
  status?: JobStatusFilter;

  /** Nama worker persis (mis. "worker-hostname"). */
  @IsOptional()
  @IsString()
  worker?: string;

  /** Cari pada nama preset, nama file asli, atau id job. */
  @IsOptional()
  @IsString()
  search?: string;
}
