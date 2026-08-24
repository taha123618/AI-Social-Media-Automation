import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContentDraft {
  id: string;
  title: string | null;
  content: string;
  status: 'draft' | 'published';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function useContentDrafts(status?: string) {
  return useQuery({
    queryKey: ['content-drafts', status],
    queryFn: async () => {
      const qs = status ? `?status=${status}` : '';
      const res = await fetch(`/api/content-draft${qs}`);
      if (!res.ok) throw new Error('Failed to fetch content drafts');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as ContentDraft[];
    }
  });
}

export function useContentDraft(id: string) {
  return useQuery({
    queryKey: ['content-draft', id],
    queryFn: async () => {
      const res = await fetch(`/api/content-draft/${id}`);
      if (!res.ok) throw new Error('Failed to fetch content draft');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as ContentDraft;
    },
    enabled: !!id
  });
}

export function useCreateContentDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ContentDraft>) => {
      const res = await fetch('/api/content-draft/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create content draft');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-drafts'] });
    }
  });
}

export function useUpdateContentDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ContentDraft>) => {
      const res = await fetch(`/api/content-draft/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update content draft');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onMutate: async (updatedDraft) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['content-drafts'] });
      const previousDrafts = queryClient.getQueryData(['content-drafts']);
      
      queryClient.setQueryData(['content-drafts'], (old: any) => {
        if (!old) return old;
        // Wait, 'content-drafts' query keys have status params as well, to be perfectly optimistic we'd need to update all variants.
        // We'll invalidate on success anyway.
        return old.map((d: any) => d.id === updatedDraft.id ? { ...d, ...updatedDraft } : d);
      });

      return { previousDrafts };
    },
    onError: (err, newDraft, context) => {
      if (context?.previousDrafts) {
        queryClient.setQueryData(['content-drafts'], context.previousDrafts);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-drafts'] });
      queryClient.invalidateQueries({ queryKey: ['content-draft', variables.id] });
      // We also invalidate 'posts' since /posts might be depending on the old endpoints
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}

export function useDeleteContentDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/content-draft/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete content draft');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['content-drafts'] });
      const previousDrafts = queryClient.getQueryData(['content-drafts']);
      queryClient.setQueryData(['content-drafts'], (old: any) => old ? old.filter((d: any) => d.id !== id) : old);
      return { previousDrafts };
    },
    onError: (err, id, context) => {
      if (context?.previousDrafts) {
        queryClient.setQueryData(['content-drafts'], context.previousDrafts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['content-drafts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}
