import { apiRequest } from '@/services/api';
import type { HistoryItem, HistoryParams } from '@/types/history';

export function fetchHistory(params: HistoryParams): Promise<HistoryItem[]> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));
  query.set('order', params.order);
  if (params.search) {
    query.set('search', params.search);
  }
  if (params.platform) {
    query.set('platform', params.platform);
  }
  if (params.status) {
    query.set('status', params.status);
  }

  return apiRequest<HistoryItem[]>(`/history?${query.toString()}`);
}

export function deleteHistory(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/history/${id}`, { method: 'DELETE' });
}
