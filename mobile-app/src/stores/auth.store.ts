import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workspace } from '@/types/api';
import { backendApi } from '@/lib/backend';

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

/** Shared unauthenticated state reset */
const unauthState = {
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  isLoading: false,
  activeWorkspaceId: '',
  workspaces: [],
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  isLoading: true,
  activeWorkspaceId: '',
  workspaces: [],
  themeMode: 'system',

  // ─────────────────────────────────────────────────────────────
  // Login — must receive a real token from the DB; no fallbacks
  // ─────────────────────────────────────────────────────────────
  loginWithEmail: async (email: string, password: string) => {
    const res = await backendApi.login(email, password);

    if (!res.success || !res.user || !res.token) {
      throw new Error(res.error || 'Invalid email or password');
    }

    const user: User = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      avatarUrl: res.user.image ?? undefined,
    };
    const token: string = res.token;

    await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, token }));
    set({ user, sessionToken: token, isAuthenticated: true, isLoading: false });

    // Fetch real workspaces from DB — required, not optional
    const wsList = await backendApi.getWorkspaces();
    if (wsList.length > 0) {
      set({ workspaces: wsList, activeWorkspaceId: wsList[0].id });
      await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, wsList[0].id);
    }

    return { success: true };
  },

  // ─────────────────────────────────────────────────────────────
  // Register — creates a real user record in the DB
  // ─────────────────────────────────────────────────────────────
  registerWithEmail: async (name: string, email: string, password: string) => {
    const res = await backendApi.register(name, email, password);

    if (!res.success || !res.user || !res.token) {
      throw new Error(res.error || 'Registration failed');
    }

    const user: User = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      avatarUrl: res.user.image ?? undefined,
    };
    const token: string = res.token;

    await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, token }));
    set({ user, sessionToken: token, isAuthenticated: true, isLoading: false });

    return { success: true };
  },

  // ─────────────────────────────────────────────────────────────
  // loginWithSession — used by initAuth after token validation
  // ─────────────────────────────────────────────────────────────
  loginWithSession: async (user: User, token: string) => {
    await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, token }));
    set({ user, sessionToken: token, isAuthenticated: true, isLoading: false });
  },

  // ─────────────────────────────────────────────────────────────
  // Logout — clears DB session + all local state
  // ─────────────────────────────────────────────────────────────
  logout: async () => {
    await backendApi.logout();
    await AsyncStorage.multiRemove([STORAGE_KEY_AUTH, STORAGE_KEY_WORKSPACE]);
    set(unauthState);
  },

  // ─────────────────────────────────────────────────────────────
  // Workspace management — all operations hit the real DB
  // ─────────────────────────────────────────────────────────────
  setActiveWorkspace: async (workspaceId: string) => {
    await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, workspaceId);
    set({ activeWorkspaceId: workspaceId });
  },

  fetchWorkspaces: async () => {
    const { sessionToken } = get();
    if (!sessionToken) return;
    const wsList = await backendApi.getWorkspaces();
    if (wsList.length > 0) {
      set({ workspaces: wsList });
      if (!get().activeWorkspaceId) {
        set({ activeWorkspaceId: wsList[0].id });
        await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, wsList[0].id);
      }
    }
  },

  createWorkspace: async (name: string, planTier = 'Pro') => {
    const { sessionToken } = get();
    if (!sessionToken) throw new Error('Not authenticated');

    const newWs = await backendApi.createWorkspace(name, planTier);
    const updated = [newWs, ...get().workspaces];
    set({ workspaces: updated, activeWorkspaceId: newWs.id });
    await AsyncStorage.setItem(STORAGE_KEY_WORKSPACE, newWs.id);
    return newWs;
  },

  setThemeMode: async (mode: 'system' | 'light' | 'dark') => {
    await AsyncStorage.setItem(STORAGE_KEY_THEME, mode);
    set({ themeMode: mode });
  },

  // ─────────────────────────────────────────────────────────────
  // initAuth — validates the stored token against /api/auth/me
  // before letting the user into the app.  If the server rejects
  // the token (expired, revoked, user deleted) we clear storage
  // and force re-login.
  // ─────────────────────────────────────────────────────────────
  initAuth: async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY_THEME);
      if (storedTheme) set({ themeMode: storedTheme as 'system' | 'light' | 'dark' });

      const stored = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
      if (!stored) {
        set({ ...unauthState });
        return;
      }

      const { user, token } = JSON.parse(stored) as { user: User; token: string };

      if (!token) {
        await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
        set({ ...unauthState });
        return;
      }

      // ── Validate token against the real DB ──────────────────
      let validatedUser: User;
      try {
        const meRes = await backendApi.getMe(token);

        if (!meRes.user) {
          throw new Error('Invalid session');
        }

        validatedUser = {
          id: meRes.user.id,
          name: meRes.user.name,
          email: meRes.user.email,
          avatarUrl: meRes.user.image ?? undefined,
        };
      } catch {
        // Token was rejected or network error — force re-login
        await AsyncStorage.multiRemove([STORAGE_KEY_AUTH, STORAGE_KEY_WORKSPACE]);
        set({ ...unauthState });
        return;
      }

      const storedWorkspace = await AsyncStorage.getItem(STORAGE_KEY_WORKSPACE);
      set({
        user: validatedUser,
        sessionToken: token,
        isAuthenticated: true,
        isLoading: false,
        activeWorkspaceId: storedWorkspace || '',
      });

      // Sync latest workspaces from DB in the background
      try {
        const wsList = await backendApi.getWorkspaces();
        if (wsList.length > 0) {
          set({
            workspaces: wsList,
            activeWorkspaceId: storedWorkspace || wsList[0].id,
          });
        }
      } catch {
        // Non-fatal — user is authenticated, workspaces will load lazily
      }
    } catch {
      set({ ...unauthState });
    }
  },
}));
