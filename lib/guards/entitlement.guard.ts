import { NextResponse } from 'next/server';
import { EntitlementService } from '@/features/billing/services/entitlement.service';
import { UsageService } from '@/features/billing/services/usage.service';
import { FeatureKey } from '@/features/billing/config/plans.config';

export class EntitlementGuard {
  /**
   * Guard checking if a business is entitled to access a specific feature.
   * Returns a 403 / 402 NextResponse if disallowed, or null if allowed.
   */
  static async requireFeature(businessId: string, feature: FeatureKey): Promise<NextResponse | null> {
    const result = await EntitlementService.canAccess(businessId, feature);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'FEATURE_NOT_AVAILABLE',
          message: result.reason || `Your current plan does not include '${feature}'.`,
          requiredPlan: result.requiredPlan,
        },
        { status: 403 }
      );
    }

    return null;
  }

  /**
   * Guard checking if a business has remaining usage quota for a metered feature.
   * Returns a 429 / 402 NextResponse if limit reached, or null if allowed.
   */
  static async requireUsageLimit(
    businessId: string,
    feature: FeatureKey,
    quantity: number = 1
  ): Promise<NextResponse | null> {
    const allowed = await UsageService.canConsume(businessId, feature, quantity);

    if (!allowed) {
      const limit = await EntitlementService.getFeatureLimit(businessId, feature);
      return NextResponse.json(
        {
          error: 'PLAN_LIMIT_REACHED',
          message: `Monthly quota reached for '${feature}' (${limit} allowed). Please upgrade your plan.`,
          feature,
          limit,
        },
        { status: 429 }
      );
    }

    return null;
  }

  /**
   * Guard checking if requested article word count is within plan limits.
   */
  static async requireArticleWordLimit(businessId: string, requestedWords: number): Promise<NextResponse | null> {
    const result = await EntitlementService.canGenerateWordCount(businessId, requestedWords);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'ARTICLE_WORD_LIMIT_EXCEEDED',
          message: result.reason,
          limit: result.limit,
          requiredPlan: result.requiredPlan,
        },
        { status: 403 }
      );
    }

    return null;
  }

  /**
   * Guard checking if business can create an additional brand voice profile.
   */
  static async requireBrandVoiceLimit(businessId: string): Promise<NextResponse | null> {
    const result = await EntitlementService.canCreateBrandVoice(businessId);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'BRAND_VOICE_LIMIT_REACHED',
          message: result.reason,
          limit: result.limit,
          currentUsage: result.currentUsage,
          requiredPlan: result.requiredPlan,
        },
        { status: 403 }
      );
    }

    return null;
  }
}
