import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useCompetitorsQuery(domain = 'buffer.com') {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.competitors.list(activeWorkspaceId),
    queryFn: () => backendApi.getCompetitorInsights(domain),
    staleTime: 1000 * 60 * 5,
  });
}
