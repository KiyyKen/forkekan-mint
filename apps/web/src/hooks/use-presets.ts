import { useQuery } from '@tanstack/react-query';

import { fetchPresets } from '@/services/preset-service';

export function usePresets() {
  return useQuery({
    queryKey: ['presets'],
    queryFn: fetchPresets,
    staleTime: Infinity,
  });
}
