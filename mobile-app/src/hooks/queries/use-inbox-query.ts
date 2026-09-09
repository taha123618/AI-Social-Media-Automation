import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useInboxQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.inbox.conversations(activeWorkspaceId),
    queryFn: () => backendApi.getConversations(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
