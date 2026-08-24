import { UsageService } from '../usage.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const business = {
    findUnique: jest.fn(),
  };
  const brandProfile = {
    count: jest.fn(),
  };
  const subscriptionUsage = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  };
  const client = { business, brandProfile, subscriptionUsage };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
    brandProfile,
    subscriptionUsage,
  };
});

describe('UsageService - Metering & Quota Consumption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canConsume', () => {
    it('returns true if usage is within Free plan limit (3 used out of 5)', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_free_1',
        organization: {
          subscriptions: {
            id: 'sub_free_1',
            planId: 'free',
            status: 'ACTIVE',
          },
        },
      });
      (prisma.subscriptionUsage.findUnique as jest.Mock).mockResolvedValue({
        used: 3,
      });

      const allowed = await UsageService.canConsume('biz_free_1', 'ai_posts', 1);
      expect(allowed).toBe(true);
    });

    it('returns false if usage exceeds Free plan limit (5 used out of 5)', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_free_1',
        organization: {
          subscriptions: {
            id: 'sub_free_1',
            planId: 'free',
            status: 'ACTIVE',
          },
        },
      });
      (prisma.subscriptionUsage.findUnique as jest.Mock).mockResolvedValue({
        used: 5,
      });

      const allowed = await UsageService.canConsume('biz_free_1', 'ai_posts', 1);
      expect(allowed).toBe(false);
    });

    it('returns true unconditionally for unlimited Pro plan features', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_pro_1',
        organization: {
          subscriptions: {
            id: 'sub_pro_1',
            planId: 'pro',
            status: 'ACTIVE',
          },
        },
      });

      const allowed = await UsageService.canConsume('biz_pro_1', 'ai_posts', 100);
      expect(allowed).toBe(true);
    });
  });

  describe('consume', () => {
    it('increments usage in DB and returns updated counts', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_starter_1',
        organization: {
          subscriptions: {
            id: 'sub_123',
            planId: 'starter',
            status: 'ACTIVE',
          },
        },
      });
      (prisma.subscriptionUsage.findUnique as jest.Mock).mockResolvedValue({
        used: 10,
      });
      (prisma.subscriptionUsage.upsert as jest.Mock).mockResolvedValue({
        used: 11,
      });

      const result = await UsageService.consume('biz_starter_1', 'ai_posts', 1);
      expect(result.used).toBe(11);
      expect(result.remaining).toBe(39); // 50 limit - 11 used
    });

    it('throws an error when attempting to consume beyond quota', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_free_1',
        organization: {
          subscriptions: {
            id: 'sub_free_1',
            planId: 'free',
            status: 'ACTIVE',
          },
        },
      });
      (prisma.subscriptionUsage.findUnique as jest.Mock).mockResolvedValue({
        used: 5,
      });

      await expect(UsageService.consume('biz_free_1', 'ai_posts', 1)).rejects.toThrow(
        /Plan limit reached/
      );
    });
  });
});
