jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {},
  prisma: {},
}));

jest.mock('@/features/billing/services/entitlement.service');
jest.mock('@/features/billing/services/usage.service');

import { EntitlementGuard } from '@/lib/guards/entitlement.guard';
import { EntitlementService } from '@/features/billing/services/entitlement.service';
import { UsageService } from '@/features/billing/services/usage.service';

describe('EntitlementGuard', () => {
  const businessId = 'biz_guard_test';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireFeature', () => {
    it('returns null when business is entitled to access the feature', async () => {
      (EntitlementService.canAccess as jest.Mock).mockResolvedValue({
        allowed: true,
      });

      const response = await EntitlementGuard.requireFeature(businessId, 'api_access');
      expect(response).toBeNull();
      expect(EntitlementService.canAccess).toHaveBeenCalledWith(businessId, 'api_access');
    });

    it('returns 403 Forbidden with details when feature is not allowed on plan', async () => {
      (EntitlementService.canAccess as jest.Mock).mockResolvedValue({
        allowed: false,
        reason: 'Feature requires Pro plan',
        requiredPlan: 'Pro',
      });

      const response = await EntitlementGuard.requireFeature(businessId, 'api_access');
      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);

      const json = await response?.json();
      expect(json.error).toBe('FEATURE_NOT_AVAILABLE');
      expect(json.message).toBe('Feature requires Pro plan');
      expect(json.requiredPlan).toBe('Pro');
    });
  });

  describe('requireUsageLimit', () => {
    it('returns null when business has remaining usage credits', async () => {
      (UsageService.canConsume as jest.Mock).mockResolvedValue(true);

      const response = await EntitlementGuard.requireUsageLimit(businessId, 'ai_articles', 1);
      expect(response).toBeNull();
      expect(UsageService.canConsume).toHaveBeenCalledWith(businessId, 'ai_articles', 1);
    });

    it('returns 429 Too Many Requests when usage quota is exhausted', async () => {
      (UsageService.canConsume as jest.Mock).mockResolvedValue(false);
      (EntitlementService.getFeatureLimit as jest.Mock).mockResolvedValue(5);

      const response = await EntitlementGuard.requireUsageLimit(businessId, 'ai_articles', 1);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(429);

      const json = await response?.json();
      expect(json.error).toBe('PLAN_LIMIT_REACHED');
      expect(json.limit).toBe(5);
      expect(json.feature).toBe('ai_articles');
    });
  });

  describe('requireArticleWordLimit', () => {
    it('returns null when article words are within entitlement limit', async () => {
      (EntitlementService.canGenerateWordCount as jest.Mock).mockResolvedValue({
        allowed: true,
      });

      const response = await EntitlementGuard.requireArticleWordLimit(businessId, 800);
      expect(response).toBeNull();
      expect(EntitlementService.canGenerateWordCount).toHaveBeenCalledWith(businessId, 800);
    });

    it('returns 403 Forbidden when requested words exceed plan limit', async () => {
      (EntitlementService.canGenerateWordCount as jest.Mock).mockResolvedValue({
        allowed: false,
        reason: 'Maximum 1000 words per article on Starter tier',
        limit: 1000,
        requiredPlan: 'Pro',
      });

      const response = await EntitlementGuard.requireArticleWordLimit(businessId, 2500);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);

      const json = await response?.json();
      expect(json.error).toBe('ARTICLE_WORD_LIMIT_EXCEEDED');
      expect(json.limit).toBe(1000);
      expect(json.requiredPlan).toBe('Pro');
    });
  });

  describe('requireBrandVoiceLimit', () => {
    it('returns null when new brand voice creation is allowed', async () => {
      (EntitlementService.canCreateBrandVoice as jest.Mock).mockResolvedValue({
        allowed: true,
      });

      const response = await EntitlementGuard.requireBrandVoiceLimit(businessId);
      expect(response).toBeNull();
      expect(EntitlementService.canCreateBrandVoice).toHaveBeenCalledWith(businessId);
    });

    it('returns 403 Forbidden when brand voice limit reached', async () => {
      (EntitlementService.canCreateBrandVoice as jest.Mock).mockResolvedValue({
        allowed: false,
        reason: 'Brand voice profile limit of 1 reached on Free plan',
        limit: 1,
        currentUsage: 1,
        requiredPlan: 'Starter',
      });

      const response = await EntitlementGuard.requireBrandVoiceLimit(businessId);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);

      const json = await response?.json();
      expect(json.error).toBe('BRAND_VOICE_LIMIT_REACHED');
      expect(json.limit).toBe(1);
      expect(json.requiredPlan).toBe('Starter');
    });
  });
});
