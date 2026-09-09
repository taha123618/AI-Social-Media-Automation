import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Workspace } from '@/types/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeWorkspaceId: string;
  workspaces: Workspace[];
  themeMode: 'system' | 'light' | 'dark';
  // Actions
  loginDemo: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
  loginWithSession: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, planTier?: 'Free' | 'Starter' | 'Pro' | 'Enterprise') => Promise<Workspace>;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => Promise<void>;
  initAuth: () => Promise<void>;
}

const STORAGE_KEY_AUTH = '@social_ai_session';
const STORAGE_KEY_WORKSPACE = '@social_ai_active_workspace';
const STORAGE_KEY_THEME = '@social_ai_theme_mode';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  isLoading: true,
  activeWorkspaceId: '',
  workspaces: [],
  themeMode: 'system',

  loginDemo: async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'demo@socialai.dev',
        password: 'Password123!',
      });
      if (res.data?.success && res.data?.user) {
        const user: User = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          avatarUrl: res.data.user.image,
        };
        const token = res.data.token || `bearer_${Date.now()}`;
        await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, token }));
        set({
          user,
          sessionToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
        await get().fetchWorkspaces();
        return;
      }
    } catch { }

    const demoUser: User = {
      id: 'usr_live_user',
      name: 'Active User',
      email: 'user@socialai.dev',
    };
    const demoToken = 'bearer_live_token';
    await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user: demoUser, token: demoToken }));
    set({
      user: demoUser,
      sessionToken: demoToken,
      isAuthenticated: true,
      isLoading: false,
    });
    await get().fetchWorkspaces();
  },

  loginWithEmail: async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      if (res.data?.success && res.data?.user) {
        const user: User = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          avatarUrl: res.data.user.image,
        };
        const token = res.data.token || `bearer_${Date.now()}`;
        await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, token }));
        set({
          user,
          sessionToken: token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Automatically fetch user's real workspaces from backend
        try {
          const wsRes = await axios.get(`${API_BASE}/api/workspaces`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (wsRes.data?.data && Array.isArray(wsRes.data.data) && wsRes.data.data.length > 0) {
            set({
              workspaces: wsRes.data.data,
              activeWorkspaceId: wsRes.data.data[0].id,
            });
            await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, wsRes.data.data[0].id);
          }
        } catch (wsErr) {
          console.warn('Could not sync remote workspaces:', wsErr);
        }

        return { success: true };
      }
      throw new Error(res.data?.error || 'Invalid email or password');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      throw new Error(msg);
    }
  },

  registerWithEmail: async (name: string, email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      if (res.data?.success && res.data?.user) {
        const user: User = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          avatarUrl: res.data.user.image,
        };
        const token = res.data.token || `bearer_${Date.now()}`;
        await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, token }));
        set({
          user,
          sessionToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      throw new Error(res.data?.error || 'Registration failed');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      throw new Error(msg);
    }
  },

  loginWithSession: async (user: User, token: string) => {
    await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, token }));
    set({
      user,
      sessionToken: token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`).catch(() => { });
    } catch { }
    await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
    set({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setActiveWorkspace: async (workspaceId: string) => {
    await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, workspaceId);
    set({ activeWorkspaceId: workspaceId });
  },

  fetchWorkspaces: async () => {
    const { sessionToken } = get();
    try {
      const res = await axios.get(`${API_BASE}/api/workspaces`, {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        set({ workspaces: res.data.data });
        if (!get().activeWorkspaceId) {
          set({ activeWorkspaceId: res.data.data[0].id });
        }
      }
    } catch {
      // Fallback kept
    }
  },

  createWorkspace: async (name: string, planTier = 'Pro') => {
    const { sessionToken } = get();
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
        set({ workspaces: updated, activeWorkspaceId: newWs.id });
        await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, newWs.id);
        return newWs;
      }
    } catch {
      // Fallback if network offline
    }

    const fallbackWs: Workspace = {
      id: `biz_${Date.now()}`,
      name,
      role: 'OWNER',
      planTier: planTier as any,
    };
    const updated = [fallbackWs, ...get().workspaces];
    set({ workspaces: updated, activeWorkspaceId: fallbackWs.id });
    await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, fallbackWs.id);
    return fallbackWs;
  },

  setThemeMode: async (mode: 'system' | 'light' | 'dark') => {
    await AsyncStorage.setItem(STORAGE_KEY_THEME, mode);
    set({ themeMode: mode });
  },

  initAuth: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
      const storedWorkspace = await AsyncStorage.getItem(STORAGE_KEY_WORKSPACE);
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY_THEME);

      if (storedTheme) {
        set({ themeMode: storedTheme as any });
      }

      if (stored) {
        const { user, token } = JSON.parse(stored);
        set({
          user,
          sessionToken: token,
          isAuthenticated: true,
          isLoading: false,
          activeWorkspaceId: storedWorkspace || '',
        });

        // Background sync workspaces from backend
        try {
          const wsRes = await axios.get(`${API_BASE}/api/workspaces`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          if (wsRes.data?.data && Array.isArray(wsRes.data.data) && wsRes.data.data.length > 0) {
            set({
              workspaces: wsRes.data.data,
              activeWorkspaceId: storedWorkspace || wsRes.data.data[0].id,
            });
          }
        } catch { }
      } else {
        set({
          user: null,
          sessionToken: null,
          isAuthenticated: false,
          isLoading: false,
          activeWorkspaceId: '',
          workspaces: [],
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
