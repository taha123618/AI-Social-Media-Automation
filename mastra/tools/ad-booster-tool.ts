import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AdBoosterService } from '@/features/social/services/ad-booster.service';

/**
 * AI Ad Booster Tool
 * Suggests top-performing posts to boost and provides budget recommendations
 */
export const adBoosterTool = createTool({
  id: 'suggest-ad-boosts',
  description: 'Analyze post performance and suggest which posts to boost with paid ads',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    budget: z.number().optional().describe('Available monthly ad budget'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    suggestions: z.array(z.object({
      postId: z.string(),
      platform: z.string(),
      reason: z.string(),
      recommendedBudget: z.number(),
      targetAudience: z.string(),
      estimatedLift: z.string(),
    })),
  }),
  execute: async (input) => {
    const result = await AdBoosterService.getAdRecommendations(input.businessId);
    
    if (!result.success || !result.recommendations) {
      return { success: false, suggestions: [] };
    }

    const suggestions = result.recommendations.map((rec: any) => ({
      postId: rec.postId,
      platform: 'SOCIAL', // Aggregated
      reason: rec.reason,
      recommendedBudget: parseInt(rec.suggestedBudget.match(/\d+/)?.[0] || '10'),
      targetAudience: 'Lookalike audience based on current engagers',
      estimatedLift: '2-3x Reach & Engagement',
    }));

    return {
      success: true,
      suggestions,
    };
  },
});
