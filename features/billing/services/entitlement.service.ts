import prisma from '@/lib/prisma';
import { FeatureKey, PlanId, PLANS, PLAN_HIERARCHY } from '../config/plans.config';
import { EntitlementCheckResult } from '../types';

export class EntitlementService {
  /**
   * Resolve active plan ID for a given business / organization.
   * Returns 'free' if no active paid subscription exists.
   */
  static async resolvePlanForBusiness(businessId: string): Promise<PlanId> {
    try {
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

      if (!subscription || subscription.status !== 'ACTIVE') {
        return 'free';
      }

      const planKey = subscription.planId.toLowerCase() as PlanId;
      return PLANS[planKey] ? planKey : 'free';
    } catch {
      return 'free';
    }
  }

  /**
   * Check if a business has access to a specific feature (boolean or unlimited/nonzero limit).
   * Resolves Base Plan -> Plan Hierarchy -> Active Temporary Overrides.
   */
  static async canAccess(businessId: string, feature: FeatureKey): Promise<EntitlementCheckResult> {
    const planId = await this.resolvePlanForBusiness(businessId);
    const plan = PLANS[planId] || PLANS.free;

    // 1. Check for active temporary overrides in database
    const override = await this.getActiveOverride(businessId, feature);
    if (override) {
      if (override.enabled !== null && override.enabled !== undefined) {
        return { allowed: override.enabled, limit: override.limit ?? undefined };
      }
    }

    // 2. Check feature value in Plan configuration
    const featureVal = plan.features[feature];

    if (typeof featureVal === 'boolean') {
      if (featureVal) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `Feature '${feature}' requires an upgraded plan.`,
        requiredPlan: this.getRequiredPlanForFeature(feature),
      };
    }

    if (typeof featureVal === 'number') {
      if (featureVal === -1 || featureVal > 0) {
        return { allowed: true, limit: featureVal };
      }
      return {
        allowed: false,
        reason: `Feature '${feature}' quota is 0 on your current plan.`,
        requiredPlan: this.getRequiredPlanForFeature(feature),
        limit: 0,
      };
    }

    if (typeof featureVal === 'string') {
      return { allowed: featureVal !== 'none' };
    }

    return { allowed: false, reason: 'Unknown feature' };
  }

  /**
   * Get numeric limit for a feature (returns -1 for unlimited).
   */
  static async getFeatureLimit(businessId: string, feature: FeatureKey): Promise<number> {
    // 1. Check temporary override
    const override = await this.getActiveOverride(businessId, feature);
    if (override && override.limit !== null && override.limit !== undefined) {
      return override.limit;
    }

    const planId = await this.resolvePlanForBusiness(businessId);
    const plan = PLANS[planId] || PLANS.free;
    const val = plan.features[feature];

    return typeof val === 'number' ? val : val ? -1 : 0;
  }

  /**
   * Validate if requested word count is within plan limit.
   */
  static async canGenerateWordCount(businessId: string, requestedWords: number): Promise<EntitlementCheckResult> {
    const limit = await this.getFeatureLimit(businessId, 'article_word_limit');

    if (limit === -1 || requestedWords <= limit) {
      return { allowed: true, limit };
    }

    return {
      allowed: false,
      reason: `Requested word count (${requestedWords}) exceeds plan limit (${limit} words).`,
      requiredPlan: limit <= 3000 ? 'starter' : 'pro',
      limit,
    };
  }

  /**
   * Check if business can create an additional Brand Voice profile.
   */
  static async canCreateBrandVoice(businessId: string): Promise<EntitlementCheckResult> {
    const limit = await this.getFeatureLimit(businessId, 'brand_voice_profiles');
    if (limit === -1) {
      return { allowed: true, limit: -1 };
    }

    const count = await prisma.brandProfile.count({
      where: { businessId },
    });

    if (count < limit) {
      return { allowed: true, limit, currentUsage: count };
    }

    return {
      allowed: false,
      reason: `Brand Voice profile limit reached (${count}/${limit}). Please upgrade for more profiles.`,
      requiredPlan: limit <= 1 ? 'starter' : 'pro',
      limit,
      currentUsage: count,
    };
  }

  /**
   * Find minimum required plan for a given feature key.
   */
  static getRequiredPlanForFeature(feature: FeatureKey): PlanId {
    if (PLANS.free.features[feature]) return 'free';
    if (PLANS.starter.features[feature]) return 'starter';
    return 'pro';
  }

  /**
   * Fetch active non-expired entitlement override if present.
   */
  private static async getActiveOverride(businessId: string, feature: string) {
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { organizationId: true },
      });

      if (!business?.organizationId) return null;

      const override = await prisma.entitlementOverride.findFirst({
        where: {
          organizationId: business.organizationId,
          feature,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      return override;
    } catch {
      return null;
    }
  }
}
