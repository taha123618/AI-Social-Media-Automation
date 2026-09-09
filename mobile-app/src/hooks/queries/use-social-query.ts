import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useSocialQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.social.accounts(activeWorkspaceId),
    queryFn: () => backendApi.getConnectedAccounts(),
    staleTime: 1000 * 60 * 5,
  });
}
