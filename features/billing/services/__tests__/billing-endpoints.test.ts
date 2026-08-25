import { GET as getUsageRoute } from '@/app/api/billing/usage/route';
import { GET as getEntitlementsRoute } from '@/app/api/billing/entitlements/route';
import { GET as getInvoicesRoute } from '@/app/api/billing/invoices/route';
import { POST as postCancelRoute } from '@/app/api/billing/cancel/route';
import { POST as postReactivateRoute } from '@/app/api/billing/reactivate/route';
import { GET as getReconciliationRoute } from '@/app/api/cron/billing-reconciliation/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { BillingService } from '../billing.service';

jest.mock('@/lib/prisma', () => {
  const business = {
    findUnique: jest.fn(),
  };
  const brandProfile = {
    count: jest.fn(),
  };
  const subscription = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const subscriptionUsage = {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
  };
  const entitlementOverride = {
    findFirst: jest.fn(),
  };
  const systemActivityLog = {
    create: jest.fn(),
  };
  const errorLog = {
    create: jest.fn(),
  };

  const client = {
    business,
    brandProfile,
    subscription,
    subscriptionUsage,
    entitlementOverride,
    systemActivityLog,
    errorLog,
  };

  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
    brandProfile,
    subscription,
    subscriptionUsage,
    entitlementOverride,
    systemActivityLog,
    errorLog,
  };
});

const mockStripe: any = {
  invoices: {
    list: jest.fn(),
  },
  subscriptions: {
    update: jest.fn(),
  },
};

describe('Billing Route Handlers Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe.invoices.list.mockResolvedValue({
      data: [
        {
          id: 'in_test_123',
          number: 'INV-001',
          amount_paid: 2900,
          currency: 'usd',
          status: 'paid',
          created: 1700000000,
          invoice_pdf: 'https://stripe.com/invoice.pdf',
          hosted_invoice_url: 'https://invoice.stripe.com/123',
        },
      ],
    });
    mockStripe.subscriptions.update.mockResolvedValue({ cancel_at_period_end: true });
    BillingService.setStripe(mockStripe);
  });

  it('GET /api/billing/usage returns usage breakdown', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: 'biz_test_123',
      organization: {
        subscriptions: {
          id: 'sub_123',
          planId: 'starter',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          usage: [
            { feature: 'AI_POSTS', used: 12, limit: 50, period: 'MONTHLY' },
          ],
        },
      },
    });
    (prisma.brandProfile.count as jest.Mock).mockResolvedValue(1);

    const req = new NextRequest('http://localhost:3000/api/billing/usage?businessId=biz_test_123');
    const res = await getUsageRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.businessId).toBe('biz_test_123');
    expect(Array.isArray(json.usage)).toBe(true);
  });

  it('GET /api/billing/entitlements returns resolved plan features', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: 'biz_test_123',
      organization: {
        subscriptions: {
          id: 'sub_123',
          planId: 'starter',
          status: 'ACTIVE',
        },
      },
    });

    const req = new NextRequest('http://localhost:3000/api/billing/entitlements?businessId=biz_test_123');
    const res = await getEntitlementsRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.plan.id).toBe('starter');
    expect(json.plan.features.scheduling).toBe(true);
  });

  it('GET /api/billing/invoices lists past invoices', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: 'biz_test_123',
      organization: {
        subscriptions: {
          stripeCustomerId: 'cus_stripe_123',
        },
      },
    });

    const req = new NextRequest('http://localhost:3000/api/billing/invoices?businessId=biz_test_123');
    const res = await getInvoicesRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.invoices.length).toBe(1);
    expect(json.invoices[0].number).toBe('INV-001');
    expect(json.invoices[0].amount).toBe(2900);
  });

  it('POST /api/billing/cancel schedules cancellation at period end', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: 'biz_test_123',
      organization: {
        subscriptions: {
          id: 'sub_123',
          stripeSubscriptionId: 'sub_stripe_123',
        },
      },
    });
    (prisma.subscription.update as jest.Mock).mockResolvedValue({});

    const req = new NextRequest('http://localhost:3000/api/billing/cancel', {
      method: 'POST',
      body: JSON.stringify({ businessId: 'biz_test_123' }),
    });
    const res = await postCancelRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('POST /api/billing/reactivate restores active subscription', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: 'biz_test_123',
      organization: {
        subscriptions: {
          id: 'sub_123',
          stripeSubscriptionId: 'sub_stripe_123',
        },
      },
    });
    (prisma.subscription.update as jest.Mock).mockResolvedValue({});

    const req = new NextRequest('http://localhost:3000/api/billing/reactivate', {
      method: 'POST',
      body: JSON.stringify({ businessId: 'biz_test_123' }),
    });
    const res = await postReactivateRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('GET /api/cron/billing-reconciliation runs maintenance tasks', async () => {
    (prisma.subscription.findMany as jest.Mock).mockResolvedValue([]);

    const headers: Record<string, string> = {};
    if (process.env.CRON_SECRET) {
      headers.authorization = `Bearer ${process.env.CRON_SECRET}`;
    }

    const req = new NextRequest('http://localhost:3000/api/cron/billing-reconciliation', {
      headers,
    });
    const res = await getReconciliationRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(typeof json.reconciledCount).toBe('number');
  });
});
