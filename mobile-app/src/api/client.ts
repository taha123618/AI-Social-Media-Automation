import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/auth.store';
import { useWorkspaceStore } from '@/stores/workspace.store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Bearer token and x-business-id
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 1. Bearer Token
      const token = useAuthStore.getState().sessionToken || (await AsyncStorage.getItem('@socialai_token'));
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Multi-tenant Header
      const activeBusinessId =
        useWorkspaceStore.getState().activeWorkspaceId ||
        useAuthStore.getState().user?.id ||
        (await AsyncStorage.getItem('@socialai_active_workspace'));

      if (activeBusinessId && !config.headers['x-business-id']) {
        config.headers['x-business-id'] = activeBusinessId;
      }
    } catch {
      // Non-blocking fallback
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: 401 Handling & Error Sanitization
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Unauthorized: session expired or revoked
      const url = error.config?.url || '';
      if (!url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
        console.warn('[API Client] 401 Unauthorized received. Clearing stale session.');
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

// Typed API Helpers
export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.get<T>(url, config);
    return res.data;
  },
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.post<T>(url, data, config);
    return res.data;
  },
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.put<T>(url, data, config);
    return res.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.delete<T>(url, config);
    return res.data;
  },
};
