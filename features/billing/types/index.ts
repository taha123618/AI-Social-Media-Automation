import { FeatureKey, PlanId, PlanDefinition } from '../config/plans.config';

export * from '../config/plans.config';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | 'unpaid';

export interface UsageSummary {
  feature: FeatureKey;
  used: number;
  limit: number; // -1 for unlimited
  remaining: number; // -1 for unlimited
  percentage: number;
}

export interface BusinessSubscriptionDetails {
  plan: PlanDefinition;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  usage: UsageSummary[];
  billingPortalUrl?: string | null;
}

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPlan?: PlanId;
  limit?: number;
  currentUsage?: number;
}
