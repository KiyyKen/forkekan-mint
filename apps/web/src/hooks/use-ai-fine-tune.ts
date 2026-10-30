import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/services/api';
import { fetchAiTuningSuggestion } from '@/services/recommendation-service';

const METADATA_PENDING_STATUS = 400;
const METADATA_RETRY_LIMIT = 5;
const METADATA_RETRY_DELAY_MS = 1_500;

/**
 * AI Fine-Tune untuk platform yang sudah dipilih user — opsional, hanya
 * berjalan saat `enabled` (user menyalakan toggle), tidak otomatis saat
 * mount. Metadata diekstrak worker secara async, jadi respons 400
 * ("metadata belum tersedia") di-retry beberapa kali otomatis.
 */
export function useAiFineTune(uploadId: string | null, presetId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['ai-fine-tune', uploadId, presetId],
    queryFn: () => fetchAiTuningSuggestion(uploadId as string, presetId as string),
    enabled: enabled && uploadId !== null && presetId !== null,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === METADATA_PENDING_STATUS) {
        return failureCount < METADATA_RETRY_LIMIT;
      }
      return false;
    },
    retryDelay: METADATA_RETRY_DELAY_MS,
  });
}
