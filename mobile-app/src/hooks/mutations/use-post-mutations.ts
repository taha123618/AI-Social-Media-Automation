import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { CreatePostPayload, Post } from '@/types/api';
import { queryKeys } from '@/constants/query-keys';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function usePostMutations() {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const createPostMutation = useMutation({
    mutationFn: (payload: CreatePostPayload) => backendApi.createPost(payload),
    onSuccess: (newPost) => {
      // Optimistically insert new post into list cache
      queryClient.setQueriesData<Post[]>(
        { queryKey: ['posts'] },
        (oldPosts = []) => [newPost, ...oldPosts]
      );
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => backendApi.deletePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      // Optimistic delete
      queryClient.setQueriesData<Post[]>(
        { queryKey: ['posts'] },
        (old = []) => old.filter((p) => p.id !== postId)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: (postId: string) => backendApi.publishPost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      // Optimistic publish
      queryClient.setQueriesData<Post[]>(
        { queryKey: ['posts'] },
        (old = []) =>
          old.map((p) =>
            p.id === postId ? { ...p, status: 'PUBLISHED', publishedAt: new Date().toISOString() } : p
          )
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    createPostMutation,
    deletePostMutation,
    publishPostMutation,
  };
}
