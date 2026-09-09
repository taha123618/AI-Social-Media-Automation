import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useBillingQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.billing.usage(activeWorkspaceId),
    queryFn: () => backendApi.getBillingDetails(),
    staleTime: 1000 * 60 * 5,
  });
}
