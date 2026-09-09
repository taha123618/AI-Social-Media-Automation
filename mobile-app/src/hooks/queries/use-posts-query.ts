import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function usePostsQuery(statusFilter?: string) {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.posts.list(activeWorkspaceId, statusFilter),
    queryFn: () => postsApi.getPosts(statusFilter),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
