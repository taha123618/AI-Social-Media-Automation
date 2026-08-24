import { z } from "zod";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
});

// Zod schemas for validation
const SubscriptionCreateSchema = z.object({
  organizationId: z.string(),
  planId: z.string(),
  customerId: z.string().optional(),
});

const UsageTrackSchema = z.object({
  organizationId: z.string(),
  feature: z.enum(["AI_POSTS", "VIDEO_GENERATIONS", "TEAM_MEMBERS", "STORAGE_GB", "API_CALLS"]),
  amount: z.number().positive(),
});

export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateSchema>;
export type UsageTrackInput = z.infer<typeof UsageTrackSchema>;

export class BillingService {
  private static plans = {
    FREE: {
      id: "free",
      name: "Free",
      price: 0,
      limits: {
        AI_POSTS: 10,
        VIDEO_GENERATIONS: 2,
        TEAM_MEMBERS: 3,
        STORAGE_GB: 1,
        API_CALLS: 1000
      }
    },
    STARTER: {
      id: "starter",
      name: "Starter",
      price: 2900, // $29.00 in cents
      limits: {
        AI_POSTS: 100,
        VIDEO_GENERATIONS: 20,
        TEAM_MEMBERS: 10,
        STORAGE_GB: 10,
        API_CALLS: 10000
      }
    },
    PRO: {
      id: "pro",
      name: "Pro",
      price: 9900, // $99.00 in cents
      limits: {
        AI_POSTS: 500,
        VIDEO_GENERATIONS: 100,
        TEAM_MEMBERS: 50,
        STORAGE_GB: 50,
        API_CALLS: 100000
      }
    },
    ENTERPRISE: {
      id: "enterprise",
      name: "Enterprise",
      price: 29900, // $299.00 in cents
      limits: {
        AI_POSTS: -1, // Unlimited
        VIDEO_GENERATIONS: -1, // Unlimited
        TEAM_MEMBERS: -1, // Unlimited
        STORAGE_GB: 500,
        API_CALLS: 1000000
      }
    }
  };

  /**
   * Create or update subscription
   */
  static async createSubscription(input: SubscriptionCreateInput): Promise<{ subscriptionId: string }> {
    const validatedInput = SubscriptionCreateSchema.parse(input);
    
    const plan = this.plans[validatedInput.planId as keyof typeof this.plans];
    if (!plan) {
      throw new Error(`Invalid plan ID: ${validatedInput.planId}`);
    }

    // Get or create Stripe customer
    let customerId = validatedInput.customerId;
    if (!customerId) {
      const organization = await prisma.organization.findUnique({
        where: { id: validatedInput.organizationId }
      });
      
      if (!organization) {
        throw new Error(`Organization not found: ${validatedInput.organizationId}`);
      }

      const customer = await stripe.customers.create({
        name: organization.name,
        metadata: { organizationId: organization.id }
      });
      customerId = customer.id;
    }

    // Create or update subscription in Stripe
    let stripeSubscription;
    if (plan.price === 0) {
      // Free plan - no Stripe subscription needed
      stripeSubscription = { id: `free_${validatedInput.organizationId}` };
    } else {
      stripeSubscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: this.getStripePriceId(plan.id) }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"]
      });
    }

    // Create/update subscription record
    const subscription = await prisma.subscription.upsert({
      where: { organizationId: validatedInput.organizationId },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      create: {
        organizationId: validatedInput.organizationId,
        planId: plan.id,
        status: "ACTIVE",
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Initialize usage records
    await this.initializeUsage(subscription.id, plan);

    return { subscriptionId: subscription.id };
  }

  /**
   * Track feature usage
   */
  static async trackUsage(input: UsageTrackInput): Promise<{ allowed: boolean; remaining: number }> {
    const validatedInput = UsageTrackSchema.parse(input);

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: validatedInput.organizationId },
      include: { usage: true }
    });

    if (!subscription) {
      throw new Error(`No subscription found for organization: ${validatedInput.organizationId}`);
    }

    // Get usage limit for this feature
    const plan = this.plans[subscription.planId as keyof typeof this.plans];
    if (!plan) {
      throw new Error(`Invalid plan: ${subscription.planId}`);
    }

    const limit = plan.limits[validatedInput.feature];
    
    // Get current usage
    let usageRecord = subscription.usage.find(u => u.feature === validatedInput.feature);
    
    if (!usageRecord) {
      // Create usage record if it doesn't exist
      usageRecord = await prisma.subscriptionUsage.create({
        data: {
          subscriptionId: subscription.id,
          feature: validatedInput.feature,
          limit,
          period: "MONTHLY"
        }
      });
    }

    // Check if usage exceeds limit (-1 means unlimited)
    if (limit !== -1 && usageRecord.used + validatedInput.amount > limit) {
      return { 
        allowed: false, 
        remaining: Math.max(0, limit - usageRecord.used) 
      };
    }

    // Update usage
    await prisma.subscriptionUsage.update({
      where: { id: usageRecord.id },
      data: { 
        used: { increment: validatedInput.amount }
      }
    });

    const remaining = limit === -1 ? -1 : limit - (usageRecord.used + validatedInput.amount);
    return { allowed: true, remaining };
  }

  /**
   * Get organization billing info
   */
  static async getBillingInfo(organizationId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { 
        usage: true,
        organization: true
      }
    });

    if (!subscription) {
      return {
        plan: this.plans.FREE,
        usage: [],
        billingPortalUrl: null
      };
    }

    const plan = this.plans[subscription.planId as keyof typeof this.plans] || this.plans.FREE;

    // Get Stripe billing portal URL
    let billingPortalUrl = null;
    if (subscription.stripeCustomerId) {
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId
        });
        billingPortalUrl = session.url;
      } catch (error) {
        console.warn("Failed to create billing portal session:", error);
      }
    }

    return {
      plan,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      usage: subscription.usage.map(usage => ({
        feature: usage.feature,
        used: usage.used,
        limit: usage.limit,
        remaining: usage.limit === -1 ? -1 : Math.max(0, usage.limit - usage.used)
      })),
      billingPortalUrl
    };
  }

  /**
   * Check if feature usage is within limits
   */
  static async checkFeatureAccess(organizationId: string, feature: string): Promise<boolean> {
    const billingInfo = await this.getBillingInfo(organizationId);
    
    const usage = billingInfo.usage.find(u => u.feature === feature);
    if (!usage) return true; // No usage tracked yet
    
    return usage.limit === -1 || usage.remaining > 0;
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(payload: Buffer | string, signature: string): Promise<void> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );

      switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.created":
          await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
          
        case "customer.subscription.deleted":
          await this.handleSubscriptionCancel(event.data.object as Stripe.Subscription);
          break;
          
        case "invoice.payment_succeeded":
          await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
          break;
          
        case "invoice.payment_failed":
          await this.handlePaymentFailure(event.data.object as Stripe.Invoice);
          break;
      }
    } catch (error) {
      console.error("Webhook error:", error);
      throw error;
    }
  }

  /**
   * Get available plans
   */
  static getPlans() {
    return Object.values(this.plans);
  }

  // Private helper methods

  private static async initializeUsage(subscriptionId: string, plan: { limits: Record<string, number> }) {
    // Clear existing usage records
    await prisma.subscriptionUsage.deleteMany({
      where: { subscriptionId }
    });

    // Create new usage records for each feature
    const usageRecords = Object.entries(plan.limits).map(([feature, limit]) => ({
      subscriptionId,
      feature: feature as "AI_POSTS" | "VIDEO_GENERATIONS" | "TEAM_MEMBERS" | "STORAGE_GB" | "API_CALLS",
      limit: limit as number,
      period: "MONTHLY" as const,
      used: 0
    }));

    await prisma.subscriptionUsage.createMany({
      data: usageRecords
    });
  }

  private static getStripePriceId(planId: string): string {
    // In production, these would be real Stripe Price IDs
    const priceMap: Record<string, string> = {
      starter: "price_starter_monthly",
      pro: "price_pro_monthly", 
      enterprise: "price_enterprise_monthly"
    };
    return priceMap[planId] || "price_free";
  }

  private static async handleSubscriptionChange(stripeSubscription: Stripe.Subscription) {
    const organizationId = stripeSubscription.metadata?.organizationId;
    if (!organizationId) return;

    const statusMap: Record<string, string> = {
      active: "ACTIVE",
      past_due: "PAST_DUE",
      canceled: "CANCELED",
      unpaid: "PAST_DUE"
    };

    await prisma.subscription.update({
      where: { organizationId },
      data: {
        status: statusMap[stripeSubscription.status] as "ACTIVE" | "PAST_DUE" | "CANCELED" || "ACTIVE",
        // Note: In newer Stripe API versions, these properties might not exist
        // or have different names. Using billing_cycle_anchor as fallback.
        currentPeriodStart: new Date(stripeSubscription.billing_cycle_anchor * 1000),
        currentPeriodEnd: new Date((stripeSubscription.billing_cycle_anchor + 30 * 24 * 60 * 60) * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      }
    });
  }

  private static async handleSubscriptionCancel(stripeSubscription: Stripe.Subscription) {
    const organizationId = stripeSubscription.metadata?.organizationId;
    if (!organizationId) return;

    await prisma.subscription.update({
      where: { organizationId },
      data: { status: "CANCELED" }
    });
  }

  private static async handlePaymentSuccess(invoice: Stripe.Invoice) {
    // Handle successful payment - could send notification, update records, etc.
    console.log("Payment succeeded for invoice:", invoice.id);
  }

  private static async handlePaymentFailure(invoice: Stripe.Invoice) {
    // Handle failed payment - could send notification, downgrade plan, etc.
    console.log("Payment failed for invoice:", invoice.id);
  }
}