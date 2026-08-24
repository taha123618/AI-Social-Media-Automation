import { z } from 'zod';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { PLANS, PlanId, PlanDefinition } from '../config/plans.config';
import { UsageService } from './usage.service';
import { BusinessSubscriptionDetails } from '../types';

const CheckoutInputSchema = z.object({
  businessId: z.string(),
  planId: z.enum(['starter', 'pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export class BillingService {
  private static stripeClient: Stripe | null = null;

  /** Get or initialize Stripe client */
  static getStripe(): Stripe {
    if (!this.stripeClient) {
      this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
        apiVersion: '2026-02-25.clover',
      });
    }
    return this.stripeClient;
  }

  /** Set custom Stripe client (for testing / mocking) */
  static setStripe(client: Stripe) {
    this.stripeClient = client;
  }

  /** Expose centralized plans dictionary */
  static get plans() {
    return PLANS;
  }

  /**
   * Get public plans catalog.
   */
  static getPlans(): Record<PlanId, PlanDefinition> {
    return PLANS;
  }

  /**
   * Fetch full subscription status, plan limits, and usage progress for a business.
   */
  static async getBusinessSubscription(businessId: string): Promise<BusinessSubscriptionDetails> {
    const business = await prisma.business.findUnique({
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

    const subscription = business?.organization?.subscriptions;
    const usage = await UsageService.getUsageSummary(businessId);

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
  static async createCheckoutSession(input: z.infer<typeof CheckoutInputSchema>): Promise<{ checkoutUrl: string }> {
    const validated = CheckoutInputSchema.parse(input);

    const business = await prisma.business.findUnique({
      where: { id: validated.businessId },
      include: { organization: true },
    });

    if (!business) {
      throw new Error(`Business not found: ${validated.businessId}`);
    }

    const organizationId = business.organizationId || business.id;
    const targetPlan = PLANS[validated.planId];

    if (!targetPlan) {
      throw new Error(`Invalid plan: ${validated.planId}`);
    }

    // Determine unit price
    const unitAmount = validated.billingCycle === 'annual'
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
        businessId: validated.businessId,
        planId: validated.planId,
        billingCycle: validated.billingCycle,
      },
    });

    if (!session.url) {
      throw new Error('Failed to generate Stripe checkout URL');
    }

    return { checkoutUrl: session.url };
  }

  /**
   * Create a customer billing portal URL.
   */
  static async createPortalSession(businessId: string, returnUrl: string): Promise<{ portalUrl: string }> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

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
   * Cancel subscription at current period end.
   */
  static async cancelSubscription(businessId: string): Promise<boolean> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    const subscription = business?.organization?.subscriptions;
    if (!subscription?.stripeSubscriptionId) {
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
   * Reactivate a subscription scheduled for cancellation.
   */
  static async reactivateSubscription(businessId: string): Promise<boolean> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    const subscription = business?.organization?.subscriptions;
    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active Stripe subscription found to reactivate.');
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