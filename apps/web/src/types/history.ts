import type { ProcessingStatus } from '@/types/processing';

/** Item GET /history — docs/07 (resultId adalah field aditif). */
export interface HistoryItem {
  id: string;
  preset: string;
  status: ProcessingStatus['status'];
  createdAt: string;
  resultId: string | null;
}

export interface HistoryParams {
  page: number;
  limit: number;
  search?: string;
  platform?: string;
  status?: string;
  order: 'asc' | 'desc';
}
