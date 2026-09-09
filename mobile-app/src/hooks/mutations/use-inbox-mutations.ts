import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendApi } from '@/lib/backend';
import { Conversation } from '@/types/api';

export function useInboxMutations() {
  const queryClient = useQueryClient();

  const sendReplyMutation = useMutation({
    mutationFn: ({ conversationId, replyText }: { conversationId: string; replyText: string }) =>
      backendApi.sendReply(conversationId, replyText),
    onMutate: async ({ conversationId }) => {
      await queryClient.cancelQueries({ queryKey: ['inbox'] });
      // Optimistic update: mark conversation resolved
      queryClient.setQueriesData<Conversation[]>(
        { queryKey: ['inbox'] },
        (old = []) =>
          old.map((c) => (c.id === conversationId ? { ...c, status: 'RESOLVED', unreadCount: 0 } : c))
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  return {
    sendReplyMutation,
  };
}
