import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: () => backendApi.getWorkspaces(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
