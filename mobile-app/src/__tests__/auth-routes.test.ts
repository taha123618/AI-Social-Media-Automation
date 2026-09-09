import { describe, it, expect, beforeEach, mock } from 'bun:test';
import axios from 'axios';
import { backendApi } from '../lib/backend';
import { useAuthStore } from '../stores/auth.store';

describe('Mobile App - Auth Routes & Direct Backend Integration', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      themeMode: 'system',
    });
  });

  describe('Registration 2-Step & OTP Verification', () => {
    it('dispatches sendRegisterOtp to backend', async () => {
      const postSpy = mock((url: string, body: any) =>
        Promise.resolve({
          data: { success: true, message: 'OTP sent successfully' },
        })
      );
      (axios as any).post = postSpy;

      const res = await backendApi.sendRegisterOtp('Jane Doe', 'jane@company.com', 'SecurePass123!');
      expect(res.success).toBe(true);
      expect(postSpy).toHaveBeenCalled();
    });

    it('dispatches verifyRegisterOtp to backend and activates workspace', async () => {
      const postSpy = mock((url: string, body: any) =>
        Promise.resolve({
          data: {
            success: true,
            user: { id: 'usr_1', email: 'jane@company.com', name: 'Jane Doe' },
            token: 'jwt_token_123',
          },
        })
      );
      (axios as any).post = postSpy;

      const res = await backendApi.verifyRegisterOtp('Jane Doe', 'jane@company.com', 'SecurePass123!', '123456');
      expect(res.success).toBe(true);
      expect(res.user?.email).toBe('jane@company.com');
    });

    it('dispatches resendRegisterOtp to backend', async () => {
      const postSpy = mock((url: string, body: any) =>
        Promise.resolve({
          data: { success: true, message: 'New code sent' },
        })
      );
      (axios as any).post = postSpy;

      const res = await backendApi.resendRegisterOtp('jane@company.com', 'Jane Doe');
      expect(res.success).toBe(true);
    });
  });

  describe('Password Recovery & Reset', () => {
    it('dispatches requestPasswordReset to backend', async () => {
      const postSpy = mock((url: string, body: any) =>
        Promise.resolve({
          data: { success: true, message: 'Password reset link sent' },
        })
      );
      (axios as any).post = postSpy;

      const res = await backendApi.requestPasswordReset('founder@company.com');
      expect(res.success).toBe(true);
    });

    it('dispatches resetPassword with new credentials', async () => {
      const postSpy = mock((url: string, body: any) =>
        Promise.resolve({
          data: { success: true, message: 'Password updated successfully' },
        })
      );
      (axios as any).post = postSpy;

      const res = await backendApi.resetPassword('reset_token_abc', 'NewSecurePassword123!');
      expect(res.success).toBe(true);
    });
  });

  describe('Workspace Invitations', () => {
    it('fetches invitation details from token', async () => {
      const getSpy = mock((url: string) =>
        Promise.resolve({
          data: {
            success: true,
            invitation: {
              id: 'inv_123',
              businessName: 'Acme SaaS',
              inviterName: 'John Founder',
              role: 'ADMIN',
              email: 'teammate@company.com',
            },
          },
        })
      );
      (axios as any).get = getSpy;

      const res = await backendApi.getInvitation('invite_token_xyz');
      expect(res.success).toBe(true);
      expect(res.invitation.businessName).toBe('Acme SaaS');
      expect(res.invitation.role).toBe('ADMIN');
    });

    it('accepts team invitation via backend endpoint', async () => {
      const postSpy = mock((url: string, body: any) =>
        Promise.resolve({
          data: { success: true, message: 'Joined workspace' },
        })
      );
      (axios as any).post = postSpy;

      const res = await backendApi.acceptInvitation('invite_token_xyz');
      expect(res.success).toBe(true);
    });
  });
});
