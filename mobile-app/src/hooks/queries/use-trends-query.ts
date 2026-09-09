import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useTrendsQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.trends.events(activeWorkspaceId),
    queryFn: () => backendApi.getTrendEvents(),
    staleTime: 1000 * 60 * 5,
  });
}
