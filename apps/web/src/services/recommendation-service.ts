import { apiRequest } from '@/services/api';
import type { Recommendation } from '@/types/recommendation';

export function fetchRecommendation(uploadId: string): Promise<Recommendation> {
  return apiRequest<Recommendation>('/ai/recommendation', {
    method: 'POST',
    body: { uploadId },
  });
}
