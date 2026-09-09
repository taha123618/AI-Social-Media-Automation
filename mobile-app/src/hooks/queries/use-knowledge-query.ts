import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useKnowledgeQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.knowledge.profile(activeWorkspaceId),
    queryFn: () => backendApi.getKnowledgeProfile(),
    staleTime: 1000 * 60 * 5,
  });
}
