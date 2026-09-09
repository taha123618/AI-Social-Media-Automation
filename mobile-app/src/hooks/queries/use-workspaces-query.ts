import { useQuery } from '@tanstack/react-query';
import { workspacesApi } from '@/api/workspaces';
import { queryKeys } from '@/constants/query-keys';

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: () => workspacesApi.getWorkspaces(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
