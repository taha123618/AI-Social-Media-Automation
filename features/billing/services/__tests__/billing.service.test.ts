import { BillingService } from '../billing.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const business = {
    findUnique: jest.fn(),
  };
  const subscription = {
    findFirst: jest.fn(),
    update: jest.fn(),
  };
  const subscriptionUsage = {
    findUnique: jest.fn(),
  };
  const brandProfile = {
    count: jest.fn(),
  };
  const client = { business, subscription, subscriptionUsage, brandProfile };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
    subscription,
    subscriptionUsage,
    brandProfile,
  };
});

describe('BillingService', () => {
  const businessId = 'biz_billing_test_1';
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test_session_123' }),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test_portal_123' }),
        },
      },
      subscriptions: {
        update: jest.fn().mockResolvedValue({ cancel_at_period_end: true }),
      },
    };
    BillingService.setStripe(mockStripe);
  });

  describe('getPlans', () => {
    it('returns the catalog of available subscription plans with limits', () => {
      const plans = BillingService.getPlans();
      expect(plans).toBeDefined();
      expect(plans.free).toBeDefined();
      expect(plans.starter).toBeDefined();
      expect(plans.pro).toBeDefined();
      expect(plans.free.name).toBe('Free');
      expect(plans.starter.name).toBe('Starter');
      expect(plans.pro.name).toBe('Pro');
    });
  });

  describe('getBusinessSubscription', () => {
    it('returns Free plan default if business has no active paid subscription', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: businessId,
        organization: null,
      });

      const result = await BillingService.getBusinessSubscription(businessId);
      expect(result.plan.id).toBe('free');
      expect(result.status).toBe('active');
      expect(Array.isArray(result.usage)).toBe(true);
    });

    it('returns Starter plan and usage metrics for subscribed business', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: businessId,
        organization: {
          subscriptions: {
            id: 'sub_123',
            planId: 'starter',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_stripe_123',
            usage: [],
          },
        },
      });

      const result = await BillingService.getBusinessSubscription(businessId);
      expect(result.plan.id).toBe('starter');
      expect(result.status).toBe('active');
      expect(result.billingPortalUrl).toBe('https://billing.stripe.com/test_portal_123');
    });
  });

  describe('createCheckoutSession', () => {
    it('creates a Stripe checkout session URL for starter upgrade', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: businessId,
        organizationId: 'org_123',
      });

      const result = await BillingService.createCheckoutSession({
        businessId,
        planId: 'starter',
        billingCycle: 'monthly',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/test_session_123');
    });
  });

  describe('cancelSubscription', () => {
    it('schedules cancellation at period end for active subscription', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: businessId,
        organization: {
          subscriptions: {
            id: 'sub_123',
            stripeSubscriptionId: 'sub_stripe_active',
          },
        },
      });
      (prisma.subscription.update as jest.Mock).mockResolvedValue({});

      const success = await BillingService.cancelSubscription(businessId);
      expect(success).toBe(true);
      expect(prisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub_123' },
          data: { cancelAtPeriodEnd: true },
        })
      );
    });
  });
});
