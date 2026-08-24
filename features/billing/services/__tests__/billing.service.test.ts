import { BillingService } from '../billing.service';
import prisma from '@/lib/prisma';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_mock_123' }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'sub_stripe_mock_123' }),
    },
  }));
});

jest.mock('@/lib/prisma', () => {
  const organization = {
    findUnique: jest.fn(),
  };
  const subscription = {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  };
  const subscriptionUsage = {
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  };
  const client = { organization, subscription, subscriptionUsage };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    organization,
    subscription,
    subscriptionUsage,
  };
});

describe('BillingService', () => {
  const organizationId = 'org_billing_test_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('returns the catalog of available subscription plans with limits', () => {
      const plans = BillingService.getPlans();
      expect(plans).toBeDefined();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.some((p) => p.name === 'Free')).toBe(true);
      expect(plans.some((p) => p.name === 'Pro')).toBe(true);
    });
  });

  describe('createSubscription', () => {
    it('creates a Free tier subscription without invoking paid Stripe flows', async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue({
        id: organizationId,
        name: 'Acme Media',
      });
      (prisma.subscription.upsert as jest.Mock).mockResolvedValue({
        id: 'sub_free_123',
        organizationId,
        planId: 'FREE',
        status: 'ACTIVE',
      });
      (prisma.subscriptionUsage.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.subscriptionUsage.createMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await BillingService.createSubscription({
        organizationId,
        planId: 'FREE',
        customerId: 'cus_existing_123',
      });

      expect(result.subscriptionId).toBe('sub_free_123');
      expect(prisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId },
        })
      );
    });
  });

  describe('trackUsage', () => {
    it('allows usage when within plan limits and returns remaining quota', async () => {
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'sub_free_123',
        organizationId,
        planId: 'FREE',
        usage: [
          { id: 'u1', feature: 'AI_POSTS', used: 3 },
        ],
      });
      (prisma.subscriptionUsage.update as jest.Mock).mockResolvedValue({
        id: 'u1',
        feature: 'AI_POSTS',
        used: 5,
      });

      const result = await BillingService.trackUsage({
        organizationId,
        feature: 'AI_POSTS',
        amount: 2,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5); // Free limit is 10, 3+2=5, remaining = 10-5 = 5
    });

    it('rejects usage when exceeding plan quota limits', async () => {
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'sub_free_123',
        organizationId,
        planId: 'FREE',
        usage: [
          { id: 'u1', feature: 'AI_POSTS', used: 9 },
        ],
      });

      const result = await BillingService.trackUsage({
        organizationId,
        feature: 'AI_POSTS',
        amount: 5,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(1); // 10 - 9 = 1 remaining
    });
  });
});
