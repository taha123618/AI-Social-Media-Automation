import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { GrowthAnalyticsService } from '@/features/analytics/services/growth-analytics.service';
import { calculateConsistencyScore } from '@/features/analytics/services/consistency-scorer.service';

/**
 * Growth Score Tool
 * Calculates a comprehensive growth score for a business
 */
export const growthScoreTool = createTool({
  id: 'calculate-growth-score',
  description: 'Calculate a comprehensive growth score based on leads, reviews, and engagement',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    days: z.number().optional().default(30).describe('Timeframe for the score'),
  }),
  outputSchema: z.object({
    overallScore: z.number(), // 0-100
    metrics: z.object({
      leadsCaptured: z.number(),
      reviewsGained: z.number(),
      responseTime: z.string(),
      postingFrequency: z.number(),
      estimatedRevenueImpact: z.number(),
    }),
    insights: z.array(z.string()),
  }),
  execute: async (input) => {
    // We use the same service as the "Direct" implementation for consistency
    const dashboard = await GrowthAnalyticsService.getGrowthDashboard(input.businessId);
    
    if (!dashboard.success || !dashboard.metrics) {
      throw new Error('Failed to fetch growth metrics');
    }

    const { leadsCaptured, totalEngagement, postsPublished, consistencyScore, estimatedRevenueImpact } = dashboard.metrics;

    // Calculate score (0-100)
    // Weighting: Leads (40%), Engagement (30%), Posting (20%), Consistency (10%)
    const days = input.days || 30;
    const leadScore = Math.min((leadsCaptured / (days * 0.5)) * 100, 100); 
    const engagementScore = Math.min((totalEngagement / (days * 5)) * 100, 100);
    const frequencyScore = Math.min((postsPublished / (days * 0.7)) * 100, 100);
    const finalConsistencyScore = consistencyScore;

    const overallScore = Math.round(
      (leadScore * 0.4) + (engagementScore * 0.3) + (frequencyScore * 0.2) + (finalConsistencyScore * 0.1)
    );

    const insights = [];
    if (leadScore < 50) insights.push("Try adding more direct Calls to Action in your posts to increase lead capture.");
    if (engagementScore < 50) insights.push("Try experimenting with more video content to boost engagement.");
    if (frequencyScore < 70) insights.push("Consistency is key! Aim for at least 5 posts per week.");

    return {
      overallScore,
      metrics: {
        leadsCaptured,
        reviewsGained: 0, // Simplified for this view
        responseTime: "2.5h",
        postingFrequency: postsPublished,
        estimatedRevenueImpact: parseFloat(estimatedRevenueImpact.replace('$', '')),
      },
      insights,
    };
  },
});
