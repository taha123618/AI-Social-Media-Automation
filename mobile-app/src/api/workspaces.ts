import { http } from './client';
import { Workspace } from '@/types/api';

export const workspacesApi = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    try {
      const res = await http.get<{ success: boolean; data?: Workspace[]; workspaces?: Workspace[] }>(
        '/api/workspaces'
      );
      const list = res.data || res.workspaces;
      if (Array.isArray(list)) {
        return list;
      }
      return [];
    } catch (error) {
      console.warn('[WorkspacesAPI] Failed to fetch live workspaces:', error);
      return [];
    }
  },

  createWorkspace: async (name: string, planTier = 'Pro'): Promise<Workspace> => {
    const res = await http.post<{ success: boolean; data: Workspace }>('/api/workspaces', {
      name,
      planTier,
    });
    if (res.data) {
      return res.data;
    }
    throw new Error('Failed to create workspace on server');
  },
};
