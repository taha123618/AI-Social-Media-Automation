import { GrowthAnalyticsService } from '../growth-analytics.service';
import prisma from '@/lib/prisma';
import { calculateConsistencyScore } from '../consistency-scorer.service';

jest.mock('@/lib/prisma', () => ({
  post: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  lead: {
    count: jest.fn(),
  },
}));

jest.mock('../consistency-scorer.service', () => ({
  calculateConsistencyScore: jest.fn(),
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn().mockResolvedValue(true),
    logError: jest.fn().mockResolvedValue(true),
    error: jest.fn(),
  },
}));

jest.mock('@/services/ai/tools/growth-score.tool', () => ({
  growthScoreTool: {
    execute: jest.fn().mockResolvedValue({
      overallScore: 88,
      metrics: {
        leadsCaptured: 10,
        reviewsGained: 4,
        responseTime: '12m',
        postingFrequency: 3.5,
        estimatedRevenueImpact: 500,
      },
      insights: ['Post at 10 AM on weekdays', 'Add more video content'],
    }),
  },
}));

describe('GrowthAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGrowthDashboard', () => {
    it('computes 30-day posts, engagement, leads, and estimated revenue', async () => {
      (prisma.post.count as jest.Mock).mockResolvedValue(15);
      (prisma.post.aggregate as jest.Mock).mockResolvedValue({
        _sum: { likes: 120, comments: 45, shares: 15 },
      });
      (prisma.lead.count as jest.Mock).mockResolvedValue(6);
      (calculateConsistencyScore as jest.Mock).mockResolvedValue({
        overall: 92,
      });

      const result = await GrowthAnalyticsService.getGrowthDashboard('biz_123');

      expect(result.success).toBe(true);
      expect(result.metrics?.postsPublished).toBe(15);
      expect(result.metrics?.totalEngagement).toBe(180);
      expect(result.metrics?.leadsCaptured).toBe(6);
      expect(result.metrics?.consistencyScore).toBe(92);
      expect(result.metrics?.estimatedRevenueImpact).toBe('$300');
    });
  });

  describe('getAIInsights', () => {
    it('fetches AI-driven strategic growth recommendations using growthScoreTool', async () => {
      const result = await GrowthAnalyticsService.getAIInsights('biz_123');

      expect(result.success).toBe(true);
      if (result.success && 'overallScore' in result) {
        expect(result.overallScore).toBe(88);
        expect(result.insights).toHaveLength(2);
      }
    });
  });
});
