import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Workspace } from '@/types/api';
import { useAuthStore } from './auth.store';

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
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

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
    const sessionToken = useAuthStore.getState().sessionToken;
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE}/api/workspaces`, {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        set({ workspaces: res.data.data, isLoading: false });
        if (!get().activeWorkspaceId) {
          set({ activeWorkspaceId: res.data.data[0].id });
        }
        return;
      }
    } catch (err) {
      console.warn('[WorkspaceStore] Could not fetch remote workspaces, using cached:', err);
    }
    set({ isLoading: false });
  },

  createWorkspace: async (name: string, planTier = 'Pro') => {
    const sessionToken = useAuthStore.getState().sessionToken;
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${API_BASE}/api/workspaces`,
        { name, planTier },
        {
          headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
        }
      );
      if (res.data?.data) {
        const newWs = res.data.data;
        const updated = [newWs, ...get().workspaces];
        set({ workspaces: updated, activeWorkspaceId: newWs.id, isLoading: false });
        await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, newWs.id);
        useAuthStore.getState().setActiveWorkspace(newWs.id);
        return newWs;
      }
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
