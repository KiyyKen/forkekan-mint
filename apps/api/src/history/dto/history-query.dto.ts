import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { JOB_STATUS_FILTERS, JobStatusFilter } from '../../common/constants/job-status.constants';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/** Query GET /history — docs/07-api-specification.md. */
export class HistoryQueryDto {
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
  @IsString()
  search?: string;

  /** Slug preset platform (mis. "whatsapp-story"). */
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsIn(JOB_STATUS_FILTERS)
  status?: JobStatusFilter;

  @IsOptional()
  @IsIn(['createdAt'])
  sort = 'createdAt' as const;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
