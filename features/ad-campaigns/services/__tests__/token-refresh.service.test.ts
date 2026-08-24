import { TokenRefreshService } from '../token-refresh.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const platformCredential = {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  };
  const client = { platformCredential };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    platformCredential,
  };
});

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TokenRefreshService', () => {
  beforeAll(() => {
    process.env.GOOGLE_CLIENT_ID = 'mock-google-id';
    process.env.GOOGLE_CLIENT_SECRET = 'mock-google-secret';
  });

  afterEach(() => jest.clearAllMocks());

  describe('refreshMetaToken', () => {
    const mockCred = {
      id: 'cred-1',
      platform: 'META',
      accessToken: 'old-token',
      meta: { some: 'data' },
    };

    beforeEach(() => {
      (prisma.platformCredential.findUnique as jest.Mock).mockResolvedValue(mockCred);
    });

    it('returns false if credential not found', async () => {
      (prisma.platformCredential.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await TokenRefreshService.refreshMetaToken('nonexistent');
      expect(result).toBe(false);
    });

    it('refreshes Meta token and updates DB', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ access_token: 'new-token', expires_in: 5184000 }),
      });

      const result = await TokenRefreshService.refreshMetaToken('cred-1');

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('fb_exchange_token=old-token'),
      );
      expect(prisma.platformCredential.update).toHaveBeenCalledWith({
        where: { id: 'cred-1' },
        data: expect.objectContaining({
          accessToken: 'new-token',
        }),
      });
    });

    it('returns false on API failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await TokenRefreshService.refreshMetaToken('cred-1');
      expect(result).toBe(false);
    });
  });

  describe('refreshGoogleToken', () => {
    const mockCred = {
      id: 'cred-2',
      platform: 'GOOGLE',
      accessToken: 'old-token',
      refreshToken: 'refresh-token',
    };

    beforeEach(() => {
      (prisma.platformCredential.findUnique as jest.Mock).mockResolvedValue(mockCred);
    });

    it('returns false if no refresh token', async () => {
      (prisma.platformCredential.findUnique as jest.Mock).mockResolvedValue({ ...mockCred, refreshToken: null });
      const result = await TokenRefreshService.refreshGoogleToken('cred-2');
      expect(result).toBe(false);
    });

    it('refreshes Google token and updates DB', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ access_token: 'new-google-token', expires_in: 3600 }),
      });

      const result = await TokenRefreshService.refreshGoogleToken('cred-2');

      expect(result).toBe(true);
      expect(prisma.platformCredential.update).toHaveBeenCalledWith({
        where: { id: 'cred-2' },
        data: expect.objectContaining({
          accessToken: 'new-google-token',
        }),
      });
    });
  });

  describe('refreshExpiringTokens', () => {
    it('processes only tokens expiring within 7 days', async () => {
      const nearExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const farExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      (prisma.platformCredential.findMany as jest.Mock).mockResolvedValue([
        { id: 'c1', platform: 'META', expiresAt: nearExpiry, accessToken: 't1' },
        { id: 'c2', platform: 'GOOGLE', expiresAt: farExpiry, accessToken: 't2' },
      ]);

      mockFetch.mockResolvedValue({
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });
      (prisma.platformCredential.findUnique as jest.Mock).mockResolvedValue({
        id: 'c1',
        platform: 'META',
        accessToken: 't1',
      });

      const result = await TokenRefreshService.refreshExpiringTokens();

      expect(result.refreshed).toBe(1);
      expect(result.failed).toBe(0);
    });
  });
});
