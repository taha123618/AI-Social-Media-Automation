import { z } from 'zod';
import { ToolDefinition } from '../types';
import { AdBoosterService } from '@/features/social/services/ad-booster.service';

/**
 * AI Ad Booster Tool
 * Suggests top-performing posts to boost and provides budget recommendations
 */
export const adBoosterTool: ToolDefinition<
  { businessId: string; budget?: number },
  {
    success: boolean;
    suggestions: Array<{
      postId: string;
      platform: string;
      reason: string;
      recommendedBudget: number;
      targetAudience: string;
      estimatedLift: string;
    }>;
  }
> = {
  id: 'suggest-ad-boosts',
  name: 'Ad Booster Advisor',
  description: 'Analyze post performance and suggest which posts to boost with paid ads',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    budget: z.number().optional().describe('Available monthly ad budget'),
  }),
  execute: async (input) => {
    const result = await AdBoosterService.getAdRecommendations(input.businessId);

    if (!result.success || !result.recommendations) {
      return { success: false, suggestions: [] };
    }

    const suggestions = result.recommendations.map((rec: any) => ({
      postId: rec.postId,
      platform: 'SOCIAL',
      reason: rec.reason,
      recommendedBudget: parseInt(rec.suggestedBudget?.match(/\d+/)?.[0] || '10', 10),
      targetAudience: 'Lookalike audience based on current engagers',
      estimatedLift: '2-3x Reach & Engagement',
    }));

    return {
      success: true,
      suggestions,
    };
  },
};
