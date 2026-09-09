import { http } from './client';
import { AuthResponse, UserSession } from '@/types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await http.post<{ success: boolean; data?: AuthResponse; token?: string; user?: UserSession }>(
      '/api/auth/login',
      payload
    );
    if (res.data?.user && res.data?.token) {
      return res.data;
    }
    if (res.user && res.token) {
      return { user: res.user, token: res.token, businessId: (res as any).businessId };
    }
    throw new Error('Invalid login response from server');
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await http.post<{ success: boolean; data?: AuthResponse; token?: string; user?: UserSession }>(
      '/api/auth/register',
      payload
    );
    if (res.data?.user && res.data?.token) {
      return res.data;
    }
    if (res.user && res.token) {
      return { user: res.user, token: res.token, businessId: (res as any).businessId };
    }
    throw new Error('Invalid registration response from server');
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    return http.post('/api/auth/forgot-password', { email });
  },

  verifyOtp: async (email: string, code: string): Promise<{ success: boolean }> => {
    return http.post('/api/auth/verify-otp', { email, code });
  },
};
