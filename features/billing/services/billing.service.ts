import { z } from 'zod';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { PLANS, PlanId, FeatureKey } from '../config/plans.config';
import { BusinessSubscriptionDetails, InvoiceRecord, UsageSummary } from '../types';

export const CheckoutInputSchema = z.object({
  businessId: z.string().min(1),
  planId: z.enum(['free', 'starter', 'pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const PortalInputSchema = z.object({
  businessId: z.string().min(1),
  returnUrl: z.string().url(),
});

export class BillingService {
  private static stripeClient: Stripe | null = null;

  /**
   * Set or override Stripe client (used for testing and dependency injection).
   */
  static setStripe(client: any) {
    this.stripeClient = client;
  }

  /**
   * Lazy initialization for Stripe SDK to prevent startup crashes when keys are missing.
   */
  static getStripe(): Stripe {
    if (!this.stripeClient) {
      const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_for_testing';
      this.stripeClient = new Stripe(apiKey, {
        apiVersion: '2025-02-24.acacia' as any,
      });
    }
    return this.stripeClient;
  }

  /**
   * Get all active subscription plans.
   */
  static getPlans() {
    return PLANS;
  }

  /**
   * Retrieve active subscription and usage metrics for a specific business workspace.
   */
  static async getBusinessSubscription(businessId: string): Promise<BusinessSubscriptionDetails> {
    let business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: {
              include: {
                usage: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      business = await prisma.business.findFirst({
        include: {
          organization: {
            include: {
              subscriptions: {
                include: {
                  usage: true,
                },
              },
            },
          },
        },
      });
    }

    const subscription = business?.organization?.subscriptions;

    // Map metered usage items
    const usage: UsageSummary[] = (subscription?.usage || []).map((u) => {
      const featureKey = u.feature.toLowerCase() as FeatureKey;
      const limit = u.limit;
      const used = u.used;
      const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
      const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
      return {
        feature: featureKey,
        used,
        limit,
        remaining,
        percentage,
      };
    });

    if (!subscription) {
      return {
        plan: PLANS.free,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        usage,
        billingPortalUrl: null,
      };
    }

    const planKey = (subscription.planId?.toLowerCase() || 'free') as PlanId;
    const plan = PLANS[planKey] || PLANS.free;

    let billingPortalUrl: string | null = null;
    if (subscription.stripeCustomerId) {
      try {
        const stripe = this.getStripe();
        const portal = await stripe.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`,
        });
        billingPortalUrl = portal.url;
      } catch (err) {
        console.warn('Failed to create customer portal session:', err);
      }
    }

    return {
      plan,
      status: (subscription.status?.toLowerCase() || 'active') as any,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      usage,
      billingPortalUrl,
    };
  }

  /**
   * Create a Stripe Checkout Session for subscription purchase or plan upgrade.
   */
  static async createCheckoutSession(
    input: z.infer<typeof CheckoutInputSchema>
  ): Promise<{ checkoutUrl: string; url: string }> {
    const validated = CheckoutInputSchema.parse(input);

    let business = await prisma.business.findUnique({
      where: { id: validated.businessId },
      include: { organization: true },
    });

    if (!business) {
      business = await prisma.business.findFirst({
        include: { organization: true },
      });
    }

    if (!business) {
      throw new Error(`Business not found: ${validated.businessId}`);
    }

    const organizationId = business.organizationId || business.id;
    const targetPlan = PLANS[validated.planId];

    if (!targetPlan) {
      throw new Error(`Invalid plan: ${validated.planId}`);
    }

    // Determine unit price
    const unitAmount =
      validated.billingCycle === 'annual'
        ? targetPlan.pricing.annual * 12
        : targetPlan.pricing.monthly;

    const stripe = this.getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AI Social Media Automation - ${targetPlan.name} Plan`,
              description: targetPlan.description,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: validated.billingCycle === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: validated.successUrl,
      cancel_url: validated.cancelUrl,
      client_reference_id: organizationId,
      metadata: {
        organizationId,
        businessId: business.id,
        planId: validated.planId,
        billingCycle: validated.billingCycle,
      },
    });

    if (!session.url) {
      throw new Error('Failed to generate Stripe checkout URL');
    }

    return { checkoutUrl: session.url, url: session.url };
  }

  /**
   * Create a customer billing portal URL.
   */
  static async createPortalSession(businessId: string, returnUrl: string): Promise<{ portalUrl: string }> {
    let business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    if (!business) {
      business = await prisma.business.findFirst({
        include: {
          organization: {
            include: {
              subscriptions: true,
            },
          },
        },
      });
    }

    const customerId = business?.organization?.subscriptions?.stripeCustomerId;
    if (!customerId) {
      throw new Error('No active billing customer found for this business.');
    }

    const stripe = this.getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { portalUrl: portal.url };
  }

  /**
   * Fetch historical billing invoices from Stripe.
   */
  static async getInvoices(businessId: string): Promise<InvoiceRecord[]> {
    let business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    if (!business) {
      business = await prisma.business.findFirst({
        include: {
          organization: {
            include: {
              subscriptions: true,
            },
          },
        },
      });
    }

    const customerId = business?.organization?.subscriptions?.stripeCustomerId;
    if (!customerId) {
      return [];
    }

    try {
      const stripe = this.getStripe();
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 12,
      });

      return invoices.data.map((inv) => ({
        id: inv.id,
        amount: inv.amount_paid / 100,
        currency: inv.currency.toUpperCase(),
        status: inv.status || 'paid',
        date: new Date(inv.created * 1000).toISOString(),
        pdfUrl: inv.invoice_pdf || null,
      }));
    } catch (err) {
      console.warn('Failed to fetch invoices from Stripe:', err);
      return [];
    }
  }

  /**
   * Cancel an active subscription at current period end.
   */
  static async cancelSubscription(businessId: string): Promise<boolean> {
    let business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    if (!business) {
      business = await prisma.business.findFirst({
        include: {
          organization: {
            include: {
              subscriptions: true,
            },
          },
        },
      });
    }

    const subscription = business?.organization?.subscriptions;
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No active Stripe subscription found to cancel.');
    }

    const stripe = this.getStripe();
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    return true;
  }

  /**
   * Reactivate a pending-cancellation subscription.
   */
  static async reactivateSubscription(businessId: string): Promise<boolean> {
    let business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    if (!business) {
      business = await prisma.business.findFirst({
        include: {
          organization: {
            include: {
              subscriptions: true,
            },
          },
        },
      });
    }

    const subscription = business?.organization?.subscriptions;
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No subscription found to reactivate.');
    }

    const stripe = this.getStripe();
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    });

    return true;
  }
}