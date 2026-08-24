import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { PlanId } from '../config/plans.config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-02-25.clover',
});

export class WebhookService {
  /**
   * Validate Stripe webhook signature and construct event.
   */
  static constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Process a Stripe webhook event idempotently.
   */
  static async processEvent(event: Stripe.Event): Promise<{ status: string; message: string }> {
    // 1. Check for duplicate processing (Idempotency)
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });

    if (existing && existing.processed) {
      return { status: 'duplicate', message: 'Event already processed successfully' };
    }

    // 2. Record or update webhook event entry
    await prisma.webhookEvent.upsert({
      where: { eventId: event.id },
      update: { retryCount: { increment: 1 } },
      create: {
        provider: 'stripe',
        eventId: event.id,
        eventType: event.type,
        payload: event as any,
        processed: false,
      },
    });

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCheckoutSessionCompleted(session);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdated(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionDeleted(subscription);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaymentFailed(invoice);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaymentSucceeded(invoice);
          break;
        }

        default:
          break;
      }

      // 3. Mark event as processed
      await prisma.webhookEvent.update({
        where: { eventId: event.id },
        data: {
          processed: true,
          processedAt: new Date(),
          error: null,
        },
      });

      return { status: 'success', message: `Processed ${event.type}` };
    } catch (err: any) {
      // Record error details in database
      await prisma.webhookEvent.update({
        where: { eventId: event.id },
        data: {
          processed: false,
          error: err?.message || 'Unknown processing error',
        },
      });
      throw err;
    }
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const organizationId = session.metadata?.organizationId || session.client_reference_id;
    const planId = (session.metadata?.planId?.toLowerCase() || 'starter') as PlanId;

    if (!organizationId) return;

    await prisma.subscription.upsert({
      where: { organizationId },
      update: {
        planId,
        status: 'ACTIVE',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        organizationId,
        planId,
        status: 'ACTIVE',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    const existingSub = await prisma.subscription.findFirst({
      where: {
        OR: [{ stripeSubscriptionId: subscription.id }, { stripeCustomerId: customerId }],
      },
    });

    if (!existingSub) return;

    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'PAST_DUE',
      paused: 'PAUSED',
    };

    const status = statusMap[subscription.status] || 'ACTIVE';

    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status,
        stripeSubscriptionId: subscription.id,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodStart: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000) : new Date(),
        currentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const existingSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSub) return;

    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        planId: 'free',
        status: 'CANCELED',
        cancelAtPeriodEnd: false,
      },
    });
  }

  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    const existingSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!existingSub) return;

    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: { status: 'PAST_DUE' },
    });
  }

  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    const existingSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!existingSub) return;

    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: { status: 'ACTIVE' },
    });
  }
}
