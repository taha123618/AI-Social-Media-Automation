import { WebhookService } from '../webhook.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const webhookEvent = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  };
  const subscription = {
    upsert: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  };
  const client = { webhookEvent, subscription };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    webhookEvent,
    subscription,
  };
});

describe('WebhookService - Idempotent Stripe Webhook Ingestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('detects duplicate events and skips re-execution', async () => {
    (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue({
      eventId: 'evt_test_duplicate',
      processed: true,
    });

    const mockEvent = {
      id: 'evt_test_duplicate',
      type: 'checkout.session.completed',
      data: { object: {} },
    } as any;

    const result = await WebhookService.processEvent(mockEvent);
    expect(result.status).toBe('duplicate');
    expect(prisma.subscription.upsert).not.toHaveBeenCalled();
  });

  it('processes checkout.session.completed and activates subscription', async () => {
    (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.webhookEvent.upsert as jest.Mock).mockResolvedValue({});
    (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});

    const mockEvent = {
      id: 'evt_test_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'org_checkout_123',
          customer: 'cus_stripe_123',
          subscription: 'sub_stripe_123',
          metadata: {
            organizationId: 'org_checkout_123',
            planId: 'starter',
          },
        },
      },
    } as any;

    const result = await WebhookService.processEvent(mockEvent);
    expect(result.status).toBe('success');
    expect(prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org_checkout_123' },
        update: expect.objectContaining({ planId: 'starter', status: 'ACTIVE' }),
      })
    );
  });

  it('processes customer.subscription.deleted and downgrades to free/canceled', async () => {
    (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.webhookEvent.upsert as jest.Mock).mockResolvedValue({});
    (prisma.webhookEvent.update as jest.Mock).mockResolvedValue({});
    (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
      id: 'sub_db_1',
      stripeSubscriptionId: 'sub_stripe_canceled',
    });

    const mockEvent = {
      id: 'evt_test_delete',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_stripe_canceled',
        },
      },
    } as any;

    const result = await WebhookService.processEvent(mockEvent);
    expect(result.status).toBe('success');
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub_db_1' },
        data: expect.objectContaining({ planId: 'free', status: 'CANCELED' }),
      })
    );
  });
});
