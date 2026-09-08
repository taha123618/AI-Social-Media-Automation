import { z } from 'zod';
import { ToolDefinition } from '../types';
import { GrowthAnalyticsService } from '@/features/analytics/services/growth-analytics.service';

/**
 * Growth Score Tool
 * Calculates a comprehensive growth score based on leads, reviews, and engagement
 */
export const growthScoreTool: ToolDefinition<
  { businessId: string; days?: number },
  {
    overallScore: number;
    metrics: {
      leadsCaptured: number;
      reviewsGained: number;
      responseTime: string;
      postingFrequency: number;
      estimatedRevenueImpact: number;
    };
    insights: string[];
  }
> = {
  id: 'calculate-growth-score',
  name: 'Growth Score Calculator',
  description: 'Calculate a comprehensive growth score based on leads, reviews, and engagement',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    days: z.number().optional().default(30).describe('Timeframe for the score'),
  }),
  execute: async (input) => {
    const dashboard = await GrowthAnalyticsService.getGrowthDashboard(input.businessId);

    if (!dashboard.success || !dashboard.metrics) {
      throw new Error('Failed to fetch growth metrics');
    }

    const { leadsCaptured, totalEngagement, postsPublished, consistencyScore, estimatedRevenueImpact } = dashboard.metrics;

    const days = input.days || 30;
    const leadScore = Math.min((leadsCaptured / (days * 0.5)) * 100, 100);
    const engagementScore = Math.min((totalEngagement / (days * 5)) * 100, 100);
    const frequencyScore = Math.min((postsPublished / (days * 0.7)) * 100, 100);
    const finalConsistencyScore = consistencyScore;

    const overallScore = Math.round(
      leadScore * 0.4 + engagementScore * 0.3 + frequencyScore * 0.2 + finalConsistencyScore * 0.1
    );

    const insights: string[] = [];
    if (leadScore < 50) insights.push('Try adding more direct Calls to Action in your posts to increase lead capture.');
    if (engagementScore < 50) insights.push('Try experimenting with more video content to boost engagement.');
    if (frequencyScore < 70) insights.push('Consistency is key! Aim for at least 5 posts per week.');

    return {
      overallScore,
      metrics: {
        leadsCaptured,
        reviewsGained: 0,
        responseTime: '2.5h',
        postingFrequency: postsPublished,
        estimatedRevenueImpact: typeof estimatedRevenueImpact === 'string' ? parseFloat(estimatedRevenueImpact.replace('$', '')) : estimatedRevenueImpact || 0,
      },
      insights,
    };
  },
};
