/**
 * Response POST /ai/recommendation dengan presetId — mode AI Fine-Tune.
 * Hanya menyarankan penyesuaian kecil di atas platform yang sudah dipilih
 * user, tidak pernah mengganti platform itu sendiri.
 */
export interface TuningSuggestion {
  presetId: string;
  suggestedCrf?: number;
  suggestedBitrate?: number;
  suggestedFps?: number;
  suggestedScale?: string;
  reason: string;
}
