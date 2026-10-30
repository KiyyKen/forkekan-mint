import { apiRequest } from '@/services/api';
import type { TuningSuggestion } from '@/types/recommendation';

/**
 * AI Fine-Tune — menyarankan penyesuaian kecil (CRF/bitrate/fps/scale) untuk
 * platform yang sudah dipilih user. Mengirim `presetId` membuat
 * POST /ai/recommendation beralih ke mode ini (docs/07).
 */
export function fetchAiTuningSuggestion(
  uploadId: string,
  presetId: string,
): Promise<TuningSuggestion> {
  return apiRequest<TuningSuggestion>('/ai/recommendation', {
    method: 'POST',
    body: { uploadId, presetId },
  });
}
