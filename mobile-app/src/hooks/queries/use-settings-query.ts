import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useSettingsQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.settings.apiKeys(activeWorkspaceId),
    queryFn: () => settingsApi.getApiKeysAndWebhooks(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
