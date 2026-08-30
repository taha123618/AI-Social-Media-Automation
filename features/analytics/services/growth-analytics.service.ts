import prisma from '@/lib/prisma';
import { calculateConsistencyScore } from './consistency-scorer.service';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * Direct Implementation: Growth Analytics Service
 * Calculates key growth metrics and AI-driven growth recommendations
 */
export class GrowthAnalyticsService {
  /**
   * Get a comprehensive growth score dashboard for a business
   */
  static async getGrowthDashboard(businessId: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 1. Posts published
      const postsCount = await prisma.post.count({
        where: { businessId, status: 'POSTED', postedAt: { gte: thirtyDaysAgo } },
      });

      // 2. Engagement (Sum of likes/comments/shares)
      const engagement = await prisma.post.aggregate({
        where: { businessId, status: 'POSTED' },
        _sum: {
          likes: true,
          comments: true,
          shares: true,
        },
      });
      const totalEngagement = (engagement._sum.likes || 0) + (engagement._sum.comments || 0) + (engagement._sum.shares || 0);

      // 3. Leads captured
      const leadsCount = (await prisma.lead?.count({
        where: { businessId, createdAt: { gte: thirtyDaysAgo } },
      })) || 0;

      // 4. Posting consistency score
      const consistencyResult = await calculateConsistencyScore(businessId, 30);
      const consistencyScore = consistencyResult.overall;

      // 5. Estimated Revenue Impact
      const estimatedRevenue = leadsCount * 50; // $50 per lead estimated value

      return {
        success: true,
        metrics: {
          postsPublished: postsCount,
          totalEngagement,
          leadsCaptured: leadsCount,
          consistencyScore,
          estimatedRevenueImpact: `$${estimatedRevenue}`,
        },
        summary: `Over the last 30 days, you published ${postsCount} posts and captured ${leadsCount} leads with a consistency score of ${consistencyScore}%.`,
      };
    } catch (error) {
      console.error('GrowthAnalyticsService Error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get AI-driven strategic insights using custom Analytics Agent
   */
  static async getAIInsights(businessId: string) {
    try {
      const { growthScoreTool } = await import('@/services/ai/tools/growth-score.tool');
      const growthResult = await growthScoreTool.execute({ businessId, days: 30 });
      return { success: true, ...growthResult };
    } catch (error) {
      SystemLogger.error('GrowthAnalyticsService.getAIInsights', error);
      return { success: false, error: String(error) };
    }
  }
}
