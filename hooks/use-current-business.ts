'use client';
import { useQuery } from '@tanstack/react-query';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';

export const useCurrentBusiness = () => {
  const { data: businessId, isLoading } = useQuery({
    queryKey: ['activeWorkspaceId'],
    queryFn: () => getActiveWorkspaceId(),
    staleTime: 1000, // 1 second stale time
  });

  return { businessId: businessId ?? null, isLoading };
};
