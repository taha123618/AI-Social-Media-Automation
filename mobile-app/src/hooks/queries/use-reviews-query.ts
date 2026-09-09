import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useReviewsQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.reviews.list(activeWorkspaceId),
    queryFn: () => backendApi.getReviews(),
    staleTime: 1000 * 60 * 3,
  });
}
