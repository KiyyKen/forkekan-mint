import { apiRequest } from '@/services/api';
import type { PresetSummary } from '@/types/preset';

export function fetchPresets(): Promise<PresetSummary[]> {
  return apiRequest<PresetSummary[]>('/presets');
}
