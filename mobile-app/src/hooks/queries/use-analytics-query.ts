import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useAnalyticsQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.analytics.overview(activeWorkspaceId),
    queryFn: () => analyticsApi.getAnalytics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
