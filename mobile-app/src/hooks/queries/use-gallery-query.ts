import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { MediaAsset } from '@/types/api';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useGalleryQuery() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery<MediaAsset[]>({
    queryKey: ['gallery-assets', activeWorkspaceId],
    queryFn: () => backendApi.getMediaAssets(),
    staleTime: 1000 * 60 * 2,
  });
}
