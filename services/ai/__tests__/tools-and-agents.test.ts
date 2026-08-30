jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    activityLog: { create: jest.fn() },
    post: {
      count: jest.fn().mockResolvedValue(15),
      aggregate: jest.fn().mockResolvedValue({ _sum: { likes: 50, comments: 20, shares: 10 } }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'post-1',
          platform: 'INSTAGRAM',
          likes: 200,
          comments: 40,
          shares: 25,
          reach: 2000,
          postedAt: new Date(),
        },
      ]),
    },
    lead: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn().mockResolvedValue([]),
    },
    business: {
      findUnique: jest.fn().mockResolvedValue({ id: 'biz-123', name: 'Test Business' }),
    },
    socialAccount: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
  prisma: {
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    activityLog: { create: jest.fn() },
    post: {
      count: jest.fn().mockResolvedValue(15),
      aggregate: jest.fn().mockResolvedValue({ _sum: { likes: 50, comments: 20, shares: 10 } }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'post-1',
          platform: 'INSTAGRAM',
          likes: 200,
          comments: 40,
          shares: 25,
          reach: 2000,
          postedAt: new Date(),
        },
      ]),
    },
    lead: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn().mockResolvedValue([]),
    },
    business: {
      findUnique: jest.fn().mockResolvedValue({ id: 'biz-123', name: 'Test Business' }),
    },
    socialAccount: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logInfo: jest.fn(),
    logWarn: jest.fn(),
    logError: jest.fn(),
    logActivity: jest.fn(),
  },
}));

import {
  growthScoreTool,
  adBoosterTool,
  weatherTool,
  generateContentTool,
  analyticsAgent,
  blogWriterAgent,
  blogSeoAgent,
  postCreationAgent,
  weatherAgent,
  youtubeAgent,
} from '../index';
import { GrowthAnalyticsService } from '@/features/analytics/services/growth-analytics.service';
import { AdBoosterService } from '@/features/social/services/ad-booster.service';
import { AIService } from '@/services/ai/ai.service';
import { Platform } from '@/app/generated/prisma/enums';

describe('Custom AI Tools and Agents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(GrowthAnalyticsService, 'getGrowthDashboard').mockResolvedValue({
      success: true,
      metrics: {
        leadsCaptured: 2,
        totalEngagement: 120,
        postsPublished: 15,
        consistencyScore: 85,
        estimatedRevenueImpact: 4500,
        responseTime: '12m',
      },
    } as any);

    jest.spyOn(AdBoosterService, 'getAdRecommendations').mockResolvedValue({
      success: true,
      recommendations: [
        {
          postId: 'post-1',
          reason: 'High organic engagement',
          suggestedBudget: '$20/day',
        },
      ],
    } as any);

    jest.spyOn(AIService, 'generateWithOpenRouter').mockResolvedValue('Mock AI output text');
  });

  describe('Tools Schema Validation & Execution', () => {
    it('growthScoreTool executes and calculates score accurately', async () => {
      const result = await growthScoreTool.execute({
        businessId: 'biz-123',
        days: 30,
      });

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.metrics.leadsCaptured).toBe(2);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('adBoosterTool recommends budget based on engagement', async () => {
      const result = await adBoosterTool.execute({
        businessId: 'biz-123',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].postId).toBe('post-1');
      expect(result.suggestions[0].recommendedBudget).toBe(20);
    });

    it('weatherTool validates coordinates schema', async () => {
      expect(weatherTool.id).toBe('get-weather');
      expect((weatherTool.inputSchema as any).shape.location).toBeDefined();
    });

    it('generateContentTool validates schema and executes', async () => {
      const result = await generateContentTool.execute({
        prompt: 'Coffee shop downtown',
        platforms: [Platform.INSTAGRAM, Platform.FACEBOOK],
        tone: 'FRIENDLY',
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
    });
  });

  describe('Autonomous AI Agents Definition & Execution', () => {
    it('analyticsAgent has valid agent configuration', () => {
      expect(analyticsAgent.name).toBe('Growth Analytics Assistant');
      expect(analyticsAgent.model).toBeDefined();
      expect(analyticsAgent.tools).toBeDefined();
    });

    it('blogWriterAgent and blogSeoAgent have valid agent configurations', () => {
      expect(blogWriterAgent.name).toBe('Blog Writer Agent');
      expect(blogWriterAgent.tools).toBeDefined();
      expect(blogSeoAgent.name).toBe('SEO Specialist Agent');
      expect(blogSeoAgent.tools).toBeDefined();
    });

    it('postCreationAgent generates social copy', async () => {
      expect(postCreationAgent.name).toBe('Creative Content Producer');
      const response = await postCreationAgent.generateResponse?.(
        'Generate Instagram caption for product launch'
      );
      expect(response).toBe('Mock AI output text');
    });

    it('weatherAgent and youtubeAgent have complete definitions', () => {
      expect(weatherAgent.name).toBe('Weather Marketing Agent');
      expect(youtubeAgent.name).toBe('YouTube Content Strategist');
    });
  });
});
