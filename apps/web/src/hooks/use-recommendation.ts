import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/services/api';
import { fetchRecommendation } from '@/services/recommendation-service';

const METADATA_PENDING_STATUS = 400;
const METADATA_RETRY_LIMIT = 5;
const METADATA_RETRY_DELAY_MS = 1_500;

/**
 * Rekomendasi preset untuk sebuah upload.
 * Metadata diekstrak worker secara async, jadi respons 400
 * ("metadata belum tersedia") di-retry beberapa kali otomatis.
 */
export function useRecommendation(uploadId: string | null) {
  return useQuery({
    queryKey: ['recommendation', uploadId],
    queryFn: () => fetchRecommendation(uploadId as string),
    enabled: uploadId !== null,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === METADATA_PENDING_STATUS) {
        return failureCount < METADATA_RETRY_LIMIT;
      }
      return false;
    },
    retryDelay: METADATA_RETRY_DELAY_MS,
  });
}
