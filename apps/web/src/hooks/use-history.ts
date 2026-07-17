import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteHistory, fetchHistory } from '@/services/history-service';
import type { HistoryParams } from '@/types/history';

const HISTORY_QUERY_KEY = 'history';

export function useHistory(params: HistoryParams) {
  return useQuery({
    queryKey: [HISTORY_QUERY_KEY, params],
    queryFn: () => fetchHistory(params),
  });
}

export function useDeleteHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHistory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY] });
    },
  });
}
