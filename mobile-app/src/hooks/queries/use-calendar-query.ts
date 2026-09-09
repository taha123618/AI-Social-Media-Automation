import { useQuery } from '@tanstack/react-query';
import { calendarApi } from '@/api/calendar';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useCalendarQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: queryKeys.calendar.slots(activeWorkspaceId),
    queryFn: () => calendarApi.getCalendarSlots(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
