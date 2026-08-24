import prisma from '@/lib/prisma';
import { Platform } from '@/app/generated/prisma/client';
import { MetaBusinessManagerService } from './meta-business-manager-extended.service';
import { PostMetrics as MetaInsights } from '../types/social-posting.types';
import { SystemLogger } from '@/features/system/services/logger.service';

export interface PostAnalytics {
  postId: string;
  platform: Platform;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  profileVisits?: number;
  videoViews?: number;
  videoCompletionRate?: number;
  engagementRate?: number;
  lastUpdated: Date;
}

export interface AnalyticsTimeRange {
  startDate: Date;
  endDate: Date;
}

export interface PlatformAnalytics {
  platform: Platform;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReach: number;
  totalImpressions: number;
  averageEngagementRate: number;
  topPerformingPosts: PostAnalytics[];
}

export class AnalyticsService {
  /**
   * Update post analytics from social platform APIs
   */
  static async updatePostAnalytics(postId: string, businessId: string) {
    try {
      // Get post details from database
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          socialAccount: {
            select: {
              platform: true,
              accessToken: true,
              platformId: true,
            }
          }
        }
      });

      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }

      let insights: MetaInsights | null = null;

      // Fetch insights based on platform
      if (!post.socialAccount.accessToken) {
        throw new Error(`No access token available for post ${postId} on platform ${post.socialAccount.platform}`);
      }

      if (post.socialAccount.platform === 'FACEBOOK') {
        insights = await MetaBusinessManagerService.getFacebookPostInsights(
          post.externalPostId || postId,
          post.socialAccount.accessToken
        );
      } else if (post.socialAccount.platform === 'INSTAGRAM') {
        insights = await MetaBusinessManagerService.getInstagramMediaInsights(
          post.externalPostId || postId,
          post.socialAccount.accessToken
        );
      }

      if (insights) {
        // Update database with new analytics
        await this.updateAnalyticsInDatabase(postId, insights, post.externalPostId || undefined);

        await SystemLogger.logActivity({
          action: "POST_ANALYTICS_UPDATED",
          entity: "Post",
          details: { postId, platform: post.socialAccount.platform }
        });
      }

      return insights;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to update post analytics: ${error}`,
        source: 'AnalyticsService.updatePostAnalytics',
        context: { postId, businessId }
      });
      throw error;
    }
  }

  /**
   * Update analytics in database
   */
  private static async updateAnalyticsInDatabase(postId: string, insights: MetaInsights, externalPostId?: string) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        likes: insights.engagement.likes,
        comments: insights.engagement.comments,
        shares: insights.engagement.shares,
        saves: insights.engagement.saves,
        impressions: insights.reach.impressions,
        reach: insights.reach.reach,
        videoViews: insights.video?.views || 0,
        profileVisits: insights.reach.profileVisits || 0,
        analyticsUpdatedAt: new Date(),
        externalPostId: externalPostId || undefined,
      }
    });
  }

  /**
   * Calculate engagement rate
   */
  static calculateEngagementRate(insights: MetaInsights): number {
    const totalEngagements = 
      insights.engagement.likes + 
      insights.engagement.comments + 
      insights.engagement.shares + 
      insights.engagement.saves;
    
    const reach = insights.reach.reach || insights.reach.impressions;

    if (reach === 0) return 0;
    return (totalEngagements / reach) * 100;
  }

  /**
   * Get analytics for a specific time range
   */
  static async getAnalyticsForTimeRange(
    businessId: string,
    timeRange: AnalyticsTimeRange
  ): Promise<PlatformAnalytics[]> {
    try {
      const posts = await prisma.post.findMany({
        where: {
          businessId,
          postedAt: {
            gte: timeRange.startDate,
            lte: timeRange.endDate
          }
        }
      });

      // Group by platform
      const platformGroups = posts.reduce((groups, post) => {
        const platform = post.platform;
        if (!groups[platform]) {
          groups[platform] = [];
        }
        groups[platform].push(post);
        return groups;
      }, {} as Record<Platform, (typeof posts)[0][]>);

      // Calculate analytics for each platform
      const platformAnalytics: PlatformAnalytics[] = [];

      for (const [platform, platformPosts] of Object.entries(platformGroups)) {
        const analytics = this.calculatePlatformAnalytics(platform as Platform, platformPosts);
        platformAnalytics.push(analytics);
      }

      return platformAnalytics;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get analytics for time range: ${error}`,
        source: 'AnalyticsService.getAnalyticsForTimeRange',
        context: { businessId, timeRange }
      });
      throw error;
    }
  }

  /**
   * Calculate platform-specific analytics
   */
  private static calculatePlatformAnalytics(platform: Platform, posts: any[]): PlatformAnalytics {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
    const totalReach = posts.reduce((sum, post) => sum + (post.reach || 0), 0);
    const totalImpressions = posts.reduce((sum, post) => sum + (post.impressions || 0), 0);

    // Calculate average engagement rate
    const engagementRates = posts
      .filter(post => (post.reach || post.impressions) > 0)
      .map(post => {
        const totalEngagements = (post.likes || 0) +
          (post.comments || 0) +
          (post.shares || 0) +
          (post.saves || 0);
        const reach = post.reach || post.impressions || 1;
        return (totalEngagements / reach) * 100;
      });

    const averageEngagementRate = engagementRates.length > 0
      ? engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length
      : 0;

    // Get top performing posts
    const topPerformingPosts = posts
      .map(post => ({
        postId: post.id,
        platform: post.platform,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        saves: post.saves || 0,
        reach: post.reach || 0,
        impressions: post.impressions || 0,
        profileVisits: post.bookingClicks || 0,
        videoViews: post.videoViews || 0,
        videoCompletionRate: post.videoCompletionRate,
        engagementRate: this.calculateEngagementRate({
          engagement: {
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            saves: post.saves || 0,
            engagementRate: 0,
          },
          reach: {
            impressions: post.impressions || 0,
            reach: post.reach || 0,
          }
        }),
        lastUpdated: post.analyticsUpdatedAt || new Date()
      }))
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 10);

    return {
      platform,
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      totalReach,
      totalImpressions,
      averageEngagementRate,
      topPerformingPosts
    };
  }

  /**
   * Get comprehensive post analytics
   */
  static async getPostAnalytics(postId: string, businessId: string): Promise<PostAnalytics | null> {
    try {
      const post = await prisma.post.findUnique({
        where: { 
          id: postId,
          businessId
        },
        select: {
          id: true,
          platform: true,
          likes: true,
          comments: true,
          shares: true,
          saves: true,
          reach: true,
          impressions: true,
          bookingClicks: true,
          videoViews: true,
          videoCompletionRate: true,
          analyticsUpdatedAt: true,
        }
      });

      if (!post) {
        return null;
      }

      const metrics: MetaInsights = {
        engagement: {
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          saves: post.saves,
          engagementRate: 0,
        },
        reach: {
          impressions: post.impressions,
          reach: post.reach,
          profileVisits: post.bookingClicks,
        },
        video: {
          views: post.videoViews,
          completionRate: post.videoCompletionRate ?? 0,
          averageWatchTime: '0s',
          watchTime: 0
        }
      };

      return {
        postId: post.id,
        platform: post.platform,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saves: post.saves,
        reach: post.reach,
        impressions: post.impressions,
        profileVisits: post.bookingClicks,
        videoViews: post.videoViews,
        videoCompletionRate: post.videoCompletionRate ?? undefined,
        engagementRate: this.calculateEngagementRate(metrics),
        lastUpdated: post.analyticsUpdatedAt
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get post analytics: ${error}`,
        source: 'AnalyticsService.getPostAnalytics',
        context: { postId }
      });
      throw error;
    }
  }

  /**
   * Get story insights (limited time window - 24 hours)
   */
  static async getStoryAnalytics(storyId: string, accessToken: string): Promise<PostAnalytics | null> {
    try {
      const insights = await MetaBusinessManagerService.getStoryInsights(storyId, accessToken);

      return {
        postId: storyId,
        platform: 'INSTAGRAM',
        likes: insights.engagement.likes,
        comments: insights.engagement.comments,
        shares: insights.engagement.shares,
        saves: insights.engagement.saves,
        reach: insights.reach.reach,
        impressions: insights.reach.impressions,
        engagementRate: this.calculateEngagementRate(insights),
        lastUpdated: new Date()
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get story analytics: ${error}`,
        source: 'AnalyticsService.getStoryAnalytics',
        context: { storyId }
      });
      throw error;
    }
  }

  /**
   * Batch update analytics for multiple posts
   */
  static async batchUpdateAnalytics(postIds: string[], businessId: string) {
    const results = await Promise.allSettled(
      postIds.map(postId => this.updatePostAnalytics(postId, businessId))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    await SystemLogger.logActivity({
      action: "BATCH_ANALYTICS_UPDATE",
      entity: "Post",
      details: {
        businessId,
        totalPosts: postIds.length,
        successful,
        failed
      }
    });

    return { successful, failed, total: postIds.length };
  }

  /**
   * Get analytics summary for dashboard
   */
  static async getAnalyticsSummary(businessId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const posts = await prisma.post.findMany({
        where: {
          businessId,
          postedAt: {
            gte: startDate
          }
        }
      });

      const totalPosts = posts.length;
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
      const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
      const totalReach = posts.reduce((sum, post) => sum + (post.reach || 0), 0);
      const totalImpressions = posts.reduce((sum, post) => sum + (post.impressions || 0), 0);

      // Calculate average engagement rate
      const engagementRates = posts
        .filter(post => (post.reach || post.impressions) > 0)
        .map(post => {
          const totalEngagements = (post.likes || 0) +
            (post.comments || 0) +
            (post.shares || 0) +
            (post.saves || 0);
          const reach = post.reach || post.impressions || 1;
          return (totalEngagements / reach) * 100;
        });

      const averageEngagementRate = engagementRates.length > 0
        ? engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length
        : 0;

      return {
        totalPosts,
        totalLikes,
        totalComments,
        totalShares,
        totalReach,
        totalImpressions,
        averageEngagementRate,
        timeRange: days,
        period: `${days} days`
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get analytics summary: ${error}`,
        source: 'AnalyticsService.getAnalyticsSummary',
        context: { businessId, days }
      });
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  static async exportAnalytics(
    businessId: string,
    timeRange: AnalyticsTimeRange,
    format: 'json' | 'csv' = 'json'
  ) {
    try {
      const platformAnalytics = await this.getAnalyticsForTimeRange(businessId, timeRange);

      if (format === 'csv') {
        return this.convertToCSV(platformAnalytics);
      }

      return JSON.stringify(platformAnalytics, null, 2);
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to export analytics: ${error}`,
        source: 'AnalyticsService.exportAnalytics',
        context: { businessId, timeRange, format }
      });
      throw error;
    }
  }

  /**
   * Convert analytics data to CSV format
   */
  private static convertToCSV(platformAnalytics: PlatformAnalytics[]): string {
    const headers = [
      'Platform', 'Total Posts', 'Total Likes', 'Total Comments', 'Total Shares',
      'Total Reach', 'Total Impressions', 'Average Engagement Rate (%)'
    ];

    const rows = platformAnalytics.map(platform => [
      platform.platform,
      platform.totalPosts,
      platform.totalLikes,
      platform.totalComments,
      platform.totalShares,
      platform.totalReach,
      platform.totalImpressions,
      platform.averageEngagementRate.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
