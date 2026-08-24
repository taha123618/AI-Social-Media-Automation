import { Worker } from 'bullmq';
import { QueueManager, QUEUE_NAMES, REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import prisma from '@/lib/prisma';
import { GenerationService } from '@/features/generation/services/generation.service';

interface AnalyticsJobData {
  businessId: string;
  postId: string;
  platform: string;
  externalPostId: string;
}

interface AnalyticsMetrics {
  likes: number;
  shares: number;
  comments: number;
  impressions: number;
  clicks: number;
  reach: number;
  saves: number;
  videoViews: number;
  profileVisits: number;
  websiteClicks: number;
  bookingClicks: number;
  phoneClicks: number;
  messageClicks: number;
  directionRequests: number;
  engagementRate?: number;
}

export class AnalyticsWorker {
  /**
   * Worker for collecting social media analytics
   */
  static readonly worker = new Worker(
    QUEUE_NAMES.ANALYTICS,
    async (job) => {
      const { businessId, postId, platform } = job.data as AnalyticsJobData;

      console.log(`[ANALYTICS] Collecting analytics for post ${postId} on ${platform}`);

      try {
        const analyticsData = await AnalyticsWorker.getMockAnalytics();
        analyticsData.engagementRate = AnalyticsWorker.calculateEngagementRate(analyticsData);

        // Update PostAnalytics in database
        await AnalyticsWorker.updateAnalytics(postId, analyticsData);

        // Trigger AI feedback loop if performance is good
        if (
          analyticsData.likes > 100 ||
          analyticsData.shares > 20 ||
          (analyticsData.engagementRate ?? 0) > 5
        ) {
          await AnalyticsWorker.triggerFeedbackLoop(businessId, postId);
        }

        // Update business performance summary
        await AnalyticsWorker.updateBusinessPerformance(businessId);

        console.log(`[ANALYTICS] Successfully collected for post ${postId}`);
        return { success: true, data: analyticsData };
      } catch (error) {
        console.error(`[ANALYTICS] Failed for post ${postId}:`, error);
        throw error;
      }
    },
    { connection: REDIS_CONNECTION_CONFIG }
  );

  /**
   * Calculate engagement rate
   */
  private static calculateEngagementRate(metrics: AnalyticsMetrics): number {
    const totalEngagements =
      metrics.likes + metrics.shares + metrics.comments + metrics.clicks + metrics.saves;
    return Number(((totalEngagements / Math.max(metrics.impressions, 1)) * 100).toFixed(2));
  }

  /**
   * Mock analytics for development / fallback
   */
  private static async getMockAnalytics(): Promise<AnalyticsMetrics> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      likes: Math.floor(Math.random() * 500) + 50,
      shares: Math.floor(Math.random() * 100) + 10,
      comments: Math.floor(Math.random() * 80) + 5,
      impressions: Math.floor(Math.random() * 2000) + 200,
      clicks: Math.floor(Math.random() * 150) + 20,
      reach: Math.floor(Math.random() * 1800) + 180,
      saves: Math.floor(Math.random() * 60) + 5,
      videoViews: Math.floor(Math.random() * 400) + 20,
      profileVisits: Math.floor(Math.random() * 50) + 1,
      websiteClicks: Math.floor(Math.random() * 30) + 1,
      bookingClicks: Math.floor(Math.random() * 10),
      phoneClicks: Math.floor(Math.random() * 15),
      messageClicks: Math.floor(Math.random() * 20),
      directionRequests: Math.floor(Math.random() * 8),
    };
  }

  /**
   * Update PostAnalytics in database
   */
  private static async updateAnalytics(postId: string, data: AnalyticsMetrics) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        likes: data.likes,
        shares: data.shares,
        comments: data.comments,
        impressions: data.impressions,
        clicks: data.clicks,
        reach: data.reach,
        saves: data.saves,
        videoViews: data.videoViews,
        profileVisits: data.profileVisits,
        websiteClicks: data.websiteClicks,
        bookingClicks: data.bookingClicks,
        phoneClicks: data.phoneClicks,
        messageClicks: data.messageClicks,
        directionRequests: data.directionRequests,
        analyticsUpdatedAt: new Date()
      }
    });
  }

  /**
   * Update business performance summary
   */
  private static async updateBusinessPerformance(businessId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalPosts, totalEngagement, totalLeads] = await Promise.all([
      prisma.post.count({
        where: {
          businessId,
          status: 'POSTED',
          postedAt: { gte: thirtyDaysAgo }
        }
      }),

      prisma.post.aggregate({
        where: {
          businessId,
          status: 'POSTED',
          postedAt: { gte: thirtyDaysAgo }
        },
        _sum: {
          likes: true,
          shares: true,
          comments: true,
          impressions: true,
          clicks: true,
          reach: true,
          saves: true,
        }
      }),

      prisma.lead.count({
        where: {
          post: { businessId },
          createdAt: { gte: thirtyDaysAgo }
        }
      })
    ]);

    console.log(`[ANALYTICS] Business ${businessId} performance summary:`, {
      totalPosts,
      totalLikes: totalEngagement._sum.likes || 0,
      totalShares: totalEngagement._sum.shares || 0,
      totalComments: totalEngagement._sum.comments || 0,
      totalImpressions: totalEngagement._sum.impressions || 0,
      totalClicks: totalEngagement._sum.clicks || 0,
      totalReach: totalEngagement._sum.reach || 0,
      totalSaves: totalEngagement._sum.saves || 0,
      totalLeads
    });
  }

  /**
   * Trigger AI feedback loop for high-performing content
   */
  private static async triggerFeedbackLoop(businessId: string, postId: string) {
    console.log(`[FEEDBACK LOOP] Analyzing high-performing post ${postId} for business ${businessId}`);

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          draft: { select: { contentJson: true } },
          business: { include: { profile: true } }
        }
      });

      if (!post) return;

      const engagementRate = AnalyticsWorker.calculateEngagementRate({
        likes: post.likes,
        shares: post.shares,
        comments: post.comments,
        impressions: post.impressions,
        clicks: post.clicks,
        reach: post.reach,
        saves: post.saves,
        videoViews: post.videoViews,
        profileVisits: post.profileVisits,
        websiteClicks: post.websiteClicks,
        bookingClicks: post.bookingClicks,
        phoneClicks: post.phoneClicks,
        messageClicks: post.messageClicks,
        directionRequests: post.directionRequests,
      });

      if (engagementRate > 5) {
        await AnalyticsWorker.analyzeSuccessfulPatterns(businessId, post);
      }

      await AnalyticsWorker.generateContentRecommendations(businessId, post);
    } catch (error) {
      console.error(`[FEEDBACK LOOP] Analysis failed for post ${postId}:`, error);
    }
  }

  /**
   * Generate content recommendations based on successful posts
   */
  private static async generateContentRecommendations(
    businessId: string,
    successfulPost: {
      id: string;
      platform: string;
      draft: { contentJson: unknown } | null;
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
      clicks: number;
    }
  ) {
    try {
      const content =
        (successfulPost.draft?.contentJson as { caption?: string })?.caption || '';

      const recommendations = await GenerationService.generateContentRecommendations({
        businessId,
        successfulContent: content,
        platform: successfulPost.platform,
        metrics: {
          likes: successfulPost.likes,
          shares: successfulPost.shares,
          comments: successfulPost.comments,
          impressions: successfulPost.impressions,
          clicks: successfulPost.clicks,
        }
      });

      await prisma.contentRecommendation.create({
        data: {
          businessId,
          recommendations: JSON.stringify(recommendations),
          basedOnMetrics: {
            likes: successfulPost.likes,
            shares: successfulPost.shares,
            comments: successfulPost.comments,
            impressions: successfulPost.impressions,
            clicks: successfulPost.clicks,
          },
          status: 'PENDING'
        }
      });

      console.log(
        `[FEEDBACK LOOP] Generated ${recommendations.length} recommendations for business ${businessId}`
      );
    } catch (error) {
      console.error(`[FEEDBACK LOOP] Failed to generate recommendations:`, error);
    }
  }

  /**
   * Analyze patterns in successful posts
   */
  private static async analyzeSuccessfulPatterns(
    businessId: string,
    successfulPost: {
      id: string;
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
    }
  ) {
    const topPosts = await prisma.post.findMany({
      where: {
        businessId,
        status: 'POSTED',
        postedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      include: {
        draft: { select: { contentJson: true } }
      },
      orderBy: { likes: 'desc' },
      take: 5
    });

    if (topPosts.length < 2) return;

    const patterns = AnalyticsWorker.extractPatterns(
      topPosts.map(post => ({
        contentJson: post.draft?.contentJson,
        postedAt: post.postedAt || undefined
      }))
    );

    console.log(
      `[FEEDBACK LOOP] Identified patterns for business ${businessId}:`,
      patterns
    );
  }

  /**
   * Extract common patterns from successful posts
   */
  private static extractPatterns(
    posts: Array<{ contentJson: unknown; postedAt?: Date }>
  ): {
    topHashtags: Array<{ tag: string; count: number }>;
    topWords: Array<{ word: string; count: number }>;
    commonTiming: Record<string, number>;
    averageLength: number;
  } {
    const patterns = {
      commonHashtags: new Map<string, number>(),
      commonWords: new Map<string, number>(),
      timingPatterns: [] as string[],
      lengthRanges: [] as number[]
    };

    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was',
      'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new',
      'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'let', 'put', 'say', 'she', 'too', 'use'
    ]);

    for (const post of posts) {
      const content = (post.contentJson as { caption?: string })?.caption || '';
      const hashtags = content.match(/#[\w]+/g) || [];
      hashtags.forEach(tag => {
        patterns.commonHashtags.set(tag, (patterns.commonHashtags.get(tag) || 0) + 1);
      });
      const words = content.toLowerCase().match(/\b[\w]+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
          patterns.commonWords.set(word, (patterns.commonWords.get(word) || 0) + 1);
        }
      });
      if (post.postedAt) {
        patterns.timingPatterns.push(`${new Date(post.postedAt).getHours()}:00`);
      }
      patterns.lengthRanges.push(content.length);
    }

    return {
      topHashtags: Array.from(patterns.commonHashtags.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
      topWords: Array.from(patterns.commonWords.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 15)
        .map(([word, count]) => ({ word, count })),
      commonTiming: patterns.timingPatterns.reduce((acc: Record<string, number>, time) => {
        acc[time] = (acc[time] || 0) + 1;
        return acc;
      }, {}),
      averageLength: patterns.lengthRanges.length > 0
        ? Math.round(
            patterns.lengthRanges.reduce((a, b) => a + b, 0) / patterns.lengthRanges.length
          )
        : 0
    };
  }

  /**
   * Schedule weekly analytics collection for all recent posts
   */
  static async scheduleWeeklyCollection() {
    const posts = await prisma.post.findMany({
      where: {
        status: 'POSTED',
        postedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      include: { business: true }
    });

    for (const post of posts) {
      const analyticsQueue = QueueManager.getQueue(QUEUE_NAMES.ANALYTICS);
      await analyticsQueue.add(
        'collect-analytics',
        {
          businessId: post.businessId,
          postId: post.id,
          platform: post.platform,
          externalPostId: post.externalPostId || post.id
        },
        { delay: 24 * 60 * 60 * 1000 }
      );
    }

    console.log(`[ANALYTICS] Scheduled collection for ${posts.length} posts`);
  }

  /**
   * Get business performance insights from Post + PostAnalytics
   */
  static async getBusinessInsights(businessId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalPosts, totalEngagement, topPosts] = await Promise.all([
      prisma.post.count({
        where: {
          businessId,
          status: 'POSTED',
          postedAt: { gte: thirtyDaysAgo }
        }
      }),

      prisma.post.aggregate({
        where: {
          businessId,
          status: 'POSTED',
          postedAt: { gte: thirtyDaysAgo }
        },
        _sum: {
          likes: true,
          shares: true,
          comments: true,
          impressions: true,
          clicks: true,
          reach: true,
          saves: true,
        }
      }),

      prisma.post.findMany({
        where: {
          businessId,
          status: 'POSTED',
          postedAt: { gte: thirtyDaysAgo }
        },
        orderBy: { likes: 'desc' },
        take: 5
      })
    ]);

    return {
      totalPosts,
      totalEngagement: {
        likes: totalEngagement._sum.likes || 0,
        shares: totalEngagement._sum.shares || 0,
        comments: totalEngagement._sum.comments || 0,
        impressions: totalEngagement._sum.impressions || 0,
        clicks: totalEngagement._sum.clicks || 0,
        reach: totalEngagement._sum.reach || 0,
        saves: totalEngagement._sum.saves || 0,
      },
      topPerformingPosts: topPosts.map(post => ({
        id: post.id,
        platform: post.platform,
        likes: post.likes || 0,
        shares: post.shares || 0,
        reach: post.reach || 0,
        engagementRate: (
          ((post.likes + post.shares + post.comments) /
            Math.max(post.impressions, 1)) *
          100
        ).toFixed(2) + '%'
      }))
    };
  }
}