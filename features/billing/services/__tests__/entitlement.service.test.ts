import { EntitlementService } from '../entitlement.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const business = {
    findUnique: jest.fn(),
  };
  const brandProfile = {
    count: jest.fn(),
  };
  const entitlementOverride = {
    findFirst: jest.fn(),
  };
  const client = { business, brandProfile, entitlementOverride };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
    brandProfile,
    entitlementOverride,
  };
});

describe('EntitlementService - Centralized Plan Entitlements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolvePlanForBusiness', () => {
    it('returns free plan if no subscription exists', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_free_1',
        organization: null,
      });

      const plan = await EntitlementService.resolvePlanForBusiness('biz_free_1');
      expect(plan).toBe('free');
    });

    it('returns starter plan for active starter subscription', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_starter_1',
        organization: {
          subscriptions: {
            planId: 'starter',
            status: 'ACTIVE',
          },
        },
      });

      const plan = await EntitlementService.resolvePlanForBusiness('biz_starter_1');
      expect(plan).toBe('starter');
    });

    it('returns pro plan for active pro subscription', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_pro_1',
        organization: {
          subscriptions: {
            planId: 'pro',
            status: 'ACTIVE',
          },
        },
      });

      const plan = await EntitlementService.resolvePlanForBusiness('biz_pro_1');
      expect(plan).toBe('pro');
    });
  });

  describe('canAccess feature checks', () => {
    it('disallows scheduling for Free plan and recommends Starter', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_free_1',
        organization: null,
      });

      const result = await EntitlementService.canAccess('biz_free_1', 'scheduling');
      expect(result.allowed).toBe(false);
      expect(result.requiredPlan).toBe('starter');
    });

    it('allows scheduling for Starter plan', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_starter_1',
        organization: {
          subscriptions: {
            planId: 'starter',
            status: 'ACTIVE',
          },
        },
      });

      const result = await EntitlementService.canAccess('biz_starter_1', 'scheduling');
      expect(result.allowed).toBe(true);
    });

    it('disallows team collaboration for Starter and recommends Pro', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_starter_1',
        organization: {
          subscriptions: {
            planId: 'starter',
            status: 'ACTIVE',
          },
        },
      });

      const result = await EntitlementService.canAccess('biz_starter_1', 'team_collaboration');
      expect(result.allowed).toBe(false);
      expect(result.requiredPlan).toBe('pro');
    });

    it('allows team collaboration for Pro plan', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_pro_1',
        organization: {
          subscriptions: {
            planId: 'pro',
            status: 'ACTIVE',
          },
        },
      });

      const result = await EntitlementService.canAccess('biz_pro_1', 'team_collaboration');
      expect(result.allowed).toBe(true);
    });
  });

  describe('word count and brand voice limit guards', () => {
    it('rejects 4,000 word article on Free plan (max 3,000)', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_free_1',
        organization: null,
      });

      const result = await EntitlementService.canGenerateWordCount('biz_free_1', 4000);
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(3000);
      expect(result.requiredPlan).toBe('starter');
    });

    it('accepts 4,000 word article on Starter plan (max 8,000)', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_starter_1',
        organization: {
          subscriptions: {
            planId: 'starter',
            status: 'ACTIVE',
          },
        },
      });

      const result = await EntitlementService.canGenerateWordCount('biz_starter_1', 4000);
      expect(result.allowed).toBe(true);
    });

    it('rejects additional brand voice when Free user already has 1 profile', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_free_1',
        organization: null,
      });
      (prisma.brandProfile.count as jest.Mock).mockResolvedValue(1);

      const result = await EntitlementService.canCreateBrandVoice('biz_free_1');
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(1);
      expect(result.requiredPlan).toBe('starter');
    });
  });
});
