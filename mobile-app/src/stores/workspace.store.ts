import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workspace } from '@/types/api';
import { useAuthStore } from './auth.store';
import { backendApi } from '@/lib/backend';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  isLoading: boolean;
  // Actions
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, planTier?: 'Free' | 'Starter' | 'Pro' | 'Enterprise') => Promise<Workspace>;
}

const STORAGE_KEY_WORKSPACE = '@social_ai_active_workspace';

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: '',
  isLoading: false,

  setActiveWorkspace: async (workspaceId: string) => {
    await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, workspaceId);
    set({ activeWorkspaceId: workspaceId });
    // Also sync with auth store
    useAuthStore.getState().setActiveWorkspace(workspaceId);
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const list = await backendApi.getWorkspaces();
      if (list.length > 0) {
        set({ workspaces: list, isLoading: false });
        if (!get().activeWorkspaceId) {
          set({ activeWorkspaceId: list[0].id });
        }
        return;
      }
    } catch (err) {
      console.warn('[WorkspaceStore] Could not fetch remote workspaces, using cached:', err);
    }
    set({ isLoading: false });
  },

  createWorkspace: async (name: string, planTier = 'Pro') => {
    set({ isLoading: true });
    try {
      const newWs = await backendApi.createWorkspace(name, planTier);
      const updated = [newWs, ...get().workspaces];
      set({ workspaces: updated, activeWorkspaceId: newWs.id, isLoading: false });
      await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, newWs.id);
      useAuthStore.getState().setActiveWorkspace(newWs.id);
      return newWs;
    } catch (err) {
      console.warn('[WorkspaceStore] Create workspace API error, fallback locally:', err);
    }

    const fallbackWs: Workspace = {
      id: `biz_${Date.now()}`,
      name,
      role: 'OWNER',
      planTier: planTier as any,
    };
    const updated = [fallbackWs, ...get().workspaces];
    set({ workspaces: updated, activeWorkspaceId: fallbackWs.id, isLoading: false });
    await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, fallbackWs.id);
    useAuthStore.getState().setActiveWorkspace(fallbackWs.id);
    return fallbackWs;
  },
}));
