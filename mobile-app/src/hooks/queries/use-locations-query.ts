import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useLocationsQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.locations.list(activeWorkspaceId),
    queryFn: () => backendApi.getLocations(),
    staleTime: 1000 * 60 * 5,
  });
}
