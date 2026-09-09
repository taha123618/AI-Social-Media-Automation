import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useBlogQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.blog.articles(activeWorkspaceId),
    queryFn: () => backendApi.getBlogArticles(),
    staleTime: 1000 * 60 * 5,
  });
}
