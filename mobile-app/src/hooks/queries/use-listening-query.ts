import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useListeningQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.listening.radar(activeWorkspaceId),
    queryFn: () => backendApi.getSocialListeningRadar(),
    staleTime: 1000 * 60 * 2,
  });
}
