import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { WorkflowDraft } from '@/types/api';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useWorkflowsQuery(status = 'PENDING_REVIEW') {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery<WorkflowDraft[]>({
    queryKey: ['workflows', activeWorkspaceId, status],
    queryFn: () => backendApi.getWorkflows(status),
    staleTime: 1000 * 60,
  });
}
