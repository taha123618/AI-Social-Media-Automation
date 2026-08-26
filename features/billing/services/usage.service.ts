import prisma from '@/lib/prisma';
import { FeatureKey, PLANS } from '../config/plans.config';
import { EntitlementService } from './entitlement.service';
import { UsageSummary } from '../types';

export class UsageService {
  /**
   * Map FeatureKey to database FeatureType enum.
   */
  private static mapToFeatureType(feature: FeatureKey): any {
    switch (feature) {
      case 'ai_posts':
        return 'AI_POSTS';
      case 'ai_articles':
        return 'AI_BLOG_ARTICLES';
      default:
        return 'AI_POSTS';
    }
  }

  /**
   * Check if a business has sufficient remaining quota for a metered feature.
   */
  static async canConsume(businessId: string, feature: FeatureKey, quantity: number = 1): Promise<boolean> {
    const limit = await EntitlementService.getFeatureLimit(businessId, feature);
    if (limit === -1) {
      return true; // Unlimited
    }

    if (limit <= 0) {
      return false;
    }

    const currentUsed = await this.getCurrentUsage(businessId, feature);
    return currentUsed + quantity <= limit;
  }

  /**
   * Atomically consume quota for a metered feature.
   * Throws an error if quota is exceeded.
   */
  static async consume(businessId: string, feature: FeatureKey, quantity: number = 1): Promise<{ used: number; remaining: number }> {
    const limit = await EntitlementService.getFeatureLimit(businessId, feature);

    if (limit !== -1) {
      const allowed = await this.canConsume(businessId, feature, quantity);
      if (!allowed) {
        throw new Error(`Plan limit reached for '${feature}'. Quota exhausted for current billing period.`);
      }
    }

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

    const subscription = await this.getSubscriptionForBusiness(businessId);
    if (!subscription) {
      // If no subscription record, resolve Free plan defaults
      return { used: quantity, remaining: limit === -1 ? -1 : Math.max(0, limit - quantity) };
    }

    const featureType = this.mapToFeatureType(feature);

    // Atomically upsert usage record
    const usage = await prisma.subscriptionUsage.upsert({
      where: {
        subscriptionId_feature_period: {
          subscriptionId: subscription.id,
          feature: featureType,
          period: 'MONTHLY',
        },
      },
      update: {
        used: { increment: quantity },
      },
      create: {
        subscriptionId: subscription.id,
        feature: featureType,
        used: quantity,
        limit: limit === -1 ? 999999 : limit,
        period: 'MONTHLY',
      },
    });

    const remaining = limit === -1 ? -1 : Math.max(0, limit - usage.used);
    return { used: usage.used, remaining };
  }

  /**
   * Helper to resolve active subscription for business with owner fallback.
   */
  private static async getSubscriptionForBusiness(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organization: {
          include: {
            subscriptions: true,
          },
        },
        members: {
          where: { role: 'OWNER' },
          include: {
            user: {
              include: {
                ownedOrganizations: {
                  include: {
                    subscriptions: true,
                  },
                },
                organizationMemberships: {
                  include: {
                    organization: {
                      include: {
                        subscriptions: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!business) return null;

    let subscription = business.organization?.subscriptions;
    if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING')) {
      const owner = business.members[0]?.user;
      const ownerOrg =
        owner?.ownedOrganizations?.find((o) => o.subscriptions) ||
        owner?.organizationMemberships?.find((m) => m.organization.subscriptions)?.organization;

      if (ownerOrg?.subscriptions) {
        subscription = ownerOrg.subscriptions;
      }
    }

    return subscription || null;
  }

  /**
   * Get current usage count for a feature in active period.
   */
  static async getCurrentUsage(businessId: string, feature: FeatureKey): Promise<number> {
    try {
      const subscription = await this.getSubscriptionForBusiness(businessId);
      if (!subscription) return 0;

      const featureType = this.mapToFeatureType(feature);
      const usage = await prisma.subscriptionUsage.findUnique({
        where: {
          subscriptionId_feature_period: {
            subscriptionId: subscription.id,
            feature: featureType,
            period: 'MONTHLY',
          },
        },
      });

      return usage?.used || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get full usage and limits breakdown for all metered features.
   */
  static async getUsageSummary(businessId: string): Promise<UsageSummary[]> {
    const planId = await EntitlementService.resolvePlanForBusiness(businessId);
    const plan = PLANS[planId] || PLANS.free;

    const meteredFeatures = ['ai_posts', 'ai_articles', 'brand_voice_profiles'] as const;
    const summary: UsageSummary[] = [];

    for (const feat of meteredFeatures) {
      const rawLimit = plan.features[feat];
      const limit = typeof rawLimit === 'number' ? rawLimit : rawLimit ? -1 : 0;
      let used = 0;

      if (feat === 'brand_voice_profiles') {
        used = await prisma.brandProfile.count({ where: { businessId } });
      } else {
        used = await this.getCurrentUsage(businessId, feat);
      }

      const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
      const percentage = limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));

      summary.push({
        feature: feat,
        used,
        limit,
        remaining,
        percentage,
      });
    }

    return summary;
  }
}
