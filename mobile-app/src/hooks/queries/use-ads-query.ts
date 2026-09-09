import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useAdsQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.ads.campaigns(activeWorkspaceId),
    queryFn: () => backendApi.getAdCampaigns(),
    staleTime: 1000 * 60 * 3,
  });
}
