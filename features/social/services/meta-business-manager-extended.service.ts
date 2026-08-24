/**
 * Meta Business Manager API Integration Service
 * Handles all Facebook, Instagram, and Creator Account interactions
 */

import { Platform, SocialAccount } from '@/app/generated/prisma/client';
import { SystemLogger } from '@/features/system/services/logger.service';
import prisma from '@/lib/prisma';
import {
  PostContent,
  PostType,
  PublishPostResponse,
  PostAnalyticsResponse,
  PostMetrics,
  EngagementMetrics,
  ReachMetrics,
  VideoMetrics,
  ClickMetrics,
  MetaAccessToken,
  MetaPageInfo,
} from '@/features/social/types/social-posting.types';
import { z } from 'zod';

/**
 * Zod Schemas for Meta API Responses
 */
const MetaInsightValueSchema = z.object({
  value: z.number(),
  end_time: z.string().optional(),
});

const MetaInsightSchema = z.object({
  name: z.string(),
  period: z.string().optional(),
  values: z.array(MetaInsightValueSchema),
  title: z.string().optional(),
  description: z.string().optional(),
  id: z.string().optional(),
});

const FacebookInsightsResponseSchema = z.object({
  data: z.array(MetaInsightSchema),
  paging: z.any().optional(),
});

const InstagramMediaInsightsResponseSchema = z.object({
  id: z.string(),
  media_type: z.string(),
  media_product_type: z.string().optional(),
  insights: z.object({
    data: z.array(MetaInsightSchema),
  }).optional(),
});

const MetaCommentResponseSchema = z.object({
  id: z.string(),
});

const MetaPublishResponseSchema = z.object({
  id: z.string(),
});

const MetaMediaContainerResponseSchema = z.object({
  id: z.string(),
});

const MetaPageInsightsResponseSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  insights: z.object({
    data: z.array(MetaInsightSchema),
  }).optional(),
});

const MetaReelInsightsResponseSchema = z.object({
  data: z.array(MetaInsightSchema),
});

/**
 * Engagement Schemas
 */
const MetaSocialCommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  from: z.object({
    id: z.string(),
    username: z.string().optional(),
  }).optional(),
  timestamp: z.string().optional(),
  created_time: z.string().optional(),
  like_count: z.number().optional(),
});

const MetaCommentsResponseSchema = z.object({
  data: z.array(MetaSocialCommentSchema),
});

const MetaConversationSchema = z.object({
  id: z.string(),
  updated_time: z.string(),
  participants: z.object({
    data: z.array(z.object({
      id: z.string(),
      username: z.string().optional(),
      name: z.string().optional(),
    })),
  }).optional(),
});

const MetaConversationsResponseSchema = z.object({
  data: z.array(MetaConversationSchema),
});

const MetaMessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  from: z.object({
    id: z.string(),
    username: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  created_time: z.string(),
});

const MetaMessagesResponseSchema = z.object({
  data: z.array(MetaMessageSchema),
});

export class MetaBusinessManagerService {
  private static readonly BASE_URL = 'https://graph.facebook.com/v19.0';
  private static readonly WEBHOOK_TOKEN = process.env.META_WEBHOOK_TOKEN;

  // ============================================================================
  // Required Scopes for OAuth
  // ============================================================================

  static readonly REQUIRED_SCOPES = {
    FACEBOOK_PAGES: [
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_read_insights',
      'pages_manage_metadata',
      'pages_messaging',
    ],
    INSTAGRAM_BUSINESS: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_graph_api',
      'instagram_manage_messages',
    ],
    CREATOR_ACCOUNTS: [
      'instagram_basic',
      'instagram_graph_api',
      'instagram_content_publish',
      'instagram_manage_messages',
    ],
    ALL_PERMISSIONS: [
      'business_management',
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_read_insights',
      'pages_manage_metadata',
      'pages_messaging',
      'instagram_basic',
      'instagram_content_publish',
      'instagram_graph_api',
      'instagram_manage_messages',
    ],
  };

  // ============================================================================
  // OAuth & Token Management
  // ============================================================================

  /**
   * Get OAuth authorization URL for Meta
   */
  static getAuthorizationUrl(businessId: string, redirectUri: string): string {
    const appId = process.env.FACEBOOK_APP_ID;
    const scopes = this.REQUIRED_SCOPES.ALL_PERMISSIONS.join(',');

    return `https://www.facebook.com/v19.0/dialog/oauth?${new URLSearchParams({
      client_id: appId!,
      redirect_uri: redirectUri,
      scope: scopes,
      state: businessId,
      auth_type: 'rerequest',
      display: 'popup',
    }).toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string, redirectUri: string): Promise<MetaAccessToken> {
    try {
      const response = await fetch(`${this.BASE_URL}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`OAuth exchange failed: ${response.statusText}`);
      }

      const data = await response.json();
      const expiresAt = new Date(Date.now() + (data.expires_in as number) * 1000);

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        expiresAt,
        tokenType: data.token_type,
        isExpired: false,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to exchange OAuth code: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.exchangeCodeForToken',
      });
      throw error;
    }
  }

  /**
   * Refresh access token if expired
   */
  static async refreshTokenIfNeeded(socialAccount: SocialAccount): Promise<string> {
    if (!socialAccount.tokenExpiresAt || new Date() < socialAccount.tokenExpiresAt) {
      return socialAccount.accessToken!;
    }

    // Token expired, attempt refresh
    if (!socialAccount.refreshToken) {
      throw new Error('Token expired and no refresh token available');
    }

    try {
      const response = await fetch(`${this.BASE_URL}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          grant_type: 'fb_exchange_token',
          fb_exchange_token: socialAccount.refreshToken,
        }),
      });

      const data = await response.json();
      const expiresAt = new Date(Date.now() + (data.expires_in || 5183944) * 1000);

      // Update in database
      await prisma.socialAccount.update({
        where: { id: socialAccount.id },
        data: {
          accessToken: data.access_token,
          tokenExpiresAt: expiresAt,
        },
      });

      return data.access_token;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to refresh token: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.refreshTokenIfNeeded',
      });
      throw error;
    }
  }

  /**
   * Verify token validity
   */
  static async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/debug_token?${new URLSearchParams({
        input_token: accessToken,
        access_token: accessToken,
      }).toString()}`);

      const data = await response.json();
      return data.data?.is_valid === true;
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // Facebook Publishing
  // ============================================================================

  /**
   * Publish post to Facebook page
   */
  static async publishToFacebook(
    pageId: string,
    accessToken: string,
    content: PostContent,
    mediaUrls?: string[]
  ): Promise<{ postId: string; url: string }> {
    try {
      const validToken = await this.verifyToken(accessToken);
      if (!validToken) {
        throw new Error('Invalid or expired access token');
      }

      const payload: Record<string, string | boolean | number> = {
        message: content.text || content.caption || '',
        access_token: accessToken,
      };

      // Add links if provided
      if (content.link) {
        payload.link = content.link;
      }

      // Add images if provided
      if (mediaUrls && mediaUrls.length > 0) {
        if (mediaUrls.length === 1) {
          payload.picture = mediaUrls[0];
        } else {
          // Multi-image post
          payload.multi_share_end_card = true;
          payload.attached_media = JSON.stringify(mediaUrls.map((url) => ({
            media: {
              image: {
                src: url,
              },
            },
          })));
        }
      }

      const response = await fetch(`${this.BASE_URL}/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload as any).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const postUrl = `https://facebook.com/${data.id}`;

      // Handle first comment if provided
      if (content.firstComment) {
        try {
          await this.publishComment(data.id, accessToken, content.firstComment);
        } catch (commentError) {
          // Log but don't fail the primary post
          await SystemLogger.logError({
            message: `Main post succeeded but first comment failed: ${commentError}`,
            source: 'MetaBusinessManager',
            context: 'MetaBusinessManager.publishToFacebook.firstComment',
          });
        }
      }

      await SystemLogger.logActivity({
        action: 'PUBLISH',
        entity: 'FacebookPost',
        entityId: data.id,
        details: { pageId, message: `Successfully published to Facebook` },
      });

      return {
        postId: data.id,
        url: postUrl,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to publish to Facebook: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.publishToFacebook',
      });
      throw error;
    }
  }

  /**
   * Publish scheduled post to Facebook
   */
  static async schedulePostToFacebook(
    pageId: string,
    accessToken: string,
    content: PostContent,
    scheduledTime: Date,
    mediaUrls?: string[]
  ): Promise<{ postId: string; scheduledFor: Date }> {
    try {
      const payload: Record<string, string | boolean | number> = {
        message: content.text || content.caption || '',
        scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000),
        published: false,
        access_token: accessToken,
      };

      if (mediaUrls && mediaUrls.length > 0) {
        payload.picture = mediaUrls[0];
      }

      const response = await fetch(`${this.BASE_URL}/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload as any).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Facebook schedule error: ${error.error?.message}`);
      }

      const data = await response.json();

      return {
        postId: data.id,
        scheduledFor: scheduledTime,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to schedule Facebook post: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.schedulePostToFacebook',
      });
      throw error;
    }
  }

  // ============================================================================
  // Instagram Publishing
  // ============================================================================

  /**
   * Publish content to Instagram Business account
   */
  static async publishToInstagram(
    igBusinessAccountId: string,
    accessToken: string,
    content: PostContent,
    mediaUrls?: string[],
    postType: PostType = PostType.REEL
  ): Promise<{ containerIds: string[] }> {
    try {
      // Step 1: Create media containers
      const containerIds: string[] = [];

      if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('Instagram posts require media');
      }

      for (const mediaUrl of mediaUrls) {
        const containerPayload: Record<string, string> = {
          media_type: postType === PostType.REEL ? 'REELS_VIDEO' : 'IMAGE',
          video_url: mediaUrl,
          access_token: accessToken,
        };

        if (content.caption) {
          containerPayload.caption = content.caption;
        }

        const containerResponse = await fetch(
          `${this.BASE_URL}/${igBusinessAccountId}/media_publish_queue`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(containerPayload).toString(),
          }
        );

        if (!containerResponse.ok) {
          const error = await containerResponse.json();
          throw new Error(`Failed to create Instagram media: ${error.error?.message}`);
        }

        const containerData = await containerResponse.json();
        containerIds.push(containerData.id);
      }

      // Step 2: Publish the container
      const publishPayload = {
        creation_id: containerIds[0],
        access_token: accessToken,
      };

      const publishResponse = await fetch(
        `${this.BASE_URL}/${igBusinessAccountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(publishPayload).toString(),
        }
      );

      const rawPublishData = await publishResponse.json();
      const validatedPublishData = MetaPublishResponseSchema.parse(rawPublishData);
      const mediaId = validatedPublishData.id;

      // Handle first comment if provided
      if (content.firstComment) {
        try {
          await this.publishComment(mediaId, accessToken, content.firstComment);
        } catch (commentError) {
          // Log but don't fail the primary post
          await SystemLogger.logError({
            message: `Instagram post succeeded but first comment failed: ${commentError}`,
            source: 'MetaBusinessManager',
            context: 'MetaBusinessManager.publishToInstagram.firstComment',
          });
        }
      }

      await SystemLogger.logActivity({
        action: 'PUBLISH',
        entity: 'InstagramPost',
        entityId: containerIds[0] || 'unknown',
        details: { igBusinessAccountId, message: `Successfully published to Instagram` },
      });

      return { containerIds };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to publish to Instagram: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.publishToInstagram',
      });
      throw error;
    }
  }

  /**
   * Schedule Instagram content
   */
  static async scheduleInstagramPost(
    igBusinessAccountId: string,
    accessToken: string,
    content: PostContent,
    scheduledTime: Date,
    mediaUrl: string
  ): Promise<{ mediaId: string; scheduledFor: Date }> {
    try {
      const payload: Record<string, string> = {
        image_url: mediaUrl,
        caption: content.caption || '',
        access_token: accessToken,
      };

      const response = await fetch(`${this.BASE_URL}/${igBusinessAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule Instagram post');
      }

      const data = await response.json();

      return {
        mediaId: data.id,
        scheduledFor: scheduledTime,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to schedule Instagram post: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.scheduleInstagramPost',
      });
      throw error;
    }
  }

  /**
   * Publish a comment to a Facebook post or Instagram media
   */
  static async publishComment(
    objectId: string,
    accessToken: string,
    message: string
  ): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/${objectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          message,
          access_token: accessToken,
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API Comment error: ${error.error?.message || response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = MetaCommentResponseSchema.parse(rawData);
      return validatedData.id;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to publish comment: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.publishComment',
      });
      throw error;
    }
  }

  /**
   * Get comments for a post or media
   */
  static async getComments(
    objectId: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        fields: 'id,text,from,timestamp,like_count',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${objectId}/comments?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = MetaCommentsResponseSchema.parse(rawData);

      return validatedData.data.map(comment => ({
        id: comment.id,
        text: comment.text,
        from: {
          id: comment.from?.id || 'unknown',
          username: comment.from?.username || 'unknown',
        },
        createdAt: new Date(comment.timestamp || comment.created_time || Date.now()),
        likeCount: comment.like_count || 0,
      }));
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get comments: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getComments',
      });
      throw error;
    }
  }

  /**
   * Get Instagram Direct Message Conversations
   */
  static async getInstagramConversations(
    igAccountId: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        fields: 'id,updated_time,participants',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${igAccountId}/conversations?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = MetaConversationsResponseSchema.parse(rawData);

      return validatedData.data.map(conv => ({
        id: conv.id,
        updatedTime: new Date(conv.updated_time),
        participants: conv.participants?.data.map(p => ({
          id: p.id,
          username: p.username || p.name || 'unknown',
        })) || [],
      }));
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get conversations: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getInstagramConversations',
      });
      throw error;
    }
  }

  /**
   * Get messages for a specific conversation thread
   */
  static async getConversationMessages(
    threadId: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        fields: 'id,text,from,created_time',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${threadId}/messages?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = MetaMessagesResponseSchema.parse(rawData);

      return validatedData.data.map(msg => ({
        id: msg.id,
        text: msg.text,
        from: {
          id: msg.from?.id || 'unknown',
          username: msg.from?.username || msg.from?.name || 'unknown',
        },
        createdAt: new Date(msg.created_time),
      }));
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get messages: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getConversationMessages',
      });
      throw error;
    }
  }

  /**
   * Send Instagram Direct Message
   */
  static async sendInstagramDirectMessage(
    igAccountId: string,
    recipientId: string,
    message: string,
    accessToken: string
  ): Promise<string> {
    try {
      const payload = {
        recipient: JSON.stringify({ id: recipientId }),
        message: JSON.stringify({ text: message }),
        access_token: accessToken,
      };

      const response = await fetch(`${this.BASE_URL}/${igAccountId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload as any).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send DM: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.message_id;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to send Instagram DM: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.sendInstagramDirectMessage',
      });
      throw error;
    }
  }

  // ============================================================================
  // Facebook Messenger
  // ============================================================================

  /**
   * Get Facebook Page Conversations (Messenger)
   */
  static async getFacebookConversations(
    pageId: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        fields: 'id,updated_time,participants',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${pageId}/conversations?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch Facebook conversations: ${response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = MetaConversationsResponseSchema.parse(rawData);

      return validatedData.data.map(conv => ({
        id: conv.id,
        updatedTime: new Date(conv.updated_time),
        participants: conv.participants?.data.map(p => ({
          id: p.id,
          username: p.username || p.name || 'unknown',
        })) || [],
      }));
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to get Facebook conversations: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getFacebookConversations',
      });
      throw error;
    }
  }

  /**
   * Send Facebook Messenger Message
   */
  static async sendFacebookMessage(
    pageId: string,
    recipientId: string,
    message: string,
    accessToken: string
  ): Promise<string> {
    try {
      const payload = {
        recipient: JSON.stringify({ id: recipientId }),
        message: JSON.stringify({ text: message }),
        access_token: accessToken,
      };

      const response = await fetch(`${this.BASE_URL}/${pageId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload as any).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send Facebook message: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.message_id;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to send Facebook message: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.sendFacebookMessage',
      });
      throw error;
    }
  }

  // ============================================================================
  // Analytics & Insights
  // ============================================================================

  /**
   * Fetch Facebook post insights
   */
  static async getFacebookPostInsights(
    postId: string,
    accessToken: string
  ): Promise<PostMetrics> {
    try {
      const params = new URLSearchParams({
        fields:
          'likes.summary(true).limit(0),' +
          'comments.summary(true).limit(0),' +
          'shares,' +
          'story,' +
          'type,' +
          'created_time,' +
          'engagement,' +
          'permalink_url',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${postId}/insights?${params.toString()}`);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch Facebook insights: ${errorBody.error?.message || response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = FacebookInsightsResponseSchema.parse(rawData);
      const insightMetrics = validatedData.data;

      const metrics: PostMetrics = {
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          engagementRate: 0,
        },
        reach: {
          impressions: 0,
          reach: 0,
        },
      };

      // Parse insights
      for (const insight of insightMetrics) {
        const value = insight.values?.[0]?.value || 0;

        if (insight.name === 'post_impressions') {
          metrics.reach.impressions = value;
        } else if (insight.name === 'post_engaged_users') {
          metrics.reach.reach = value;
        } else if (insight.name === 'post_clicks') {
          metrics.click = {
            linkClicks: value,
            websiteClicks: 0
          };
        }
      }

      return metrics;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch Facebook insights: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getFacebookPostInsights',
      });
      throw error;
    }
  }

  /**
   * Fetch Instagram media insights
   */
  static async getInstagramMediaInsights(
    mediaId: string,
    accessToken: string
  ): Promise<PostMetrics> {
    try {
      const fields = [
        'id',
        'media_type',
        'media_product_type',
        'insights.metric(engagement,impressions,reach,saved,video_views,video_avg_time_watched,profile_visits)',
      ].join(',');

      const params = new URLSearchParams({
        fields,
        access_token: accessToken,
      });

      const response = await fetch(
        `${this.BASE_URL}/${mediaId}?${params.toString()}`
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch Instagram insights: ${errorBody.error?.message || response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = InstagramMediaInsightsResponseSchema.parse(rawData);
      const insightData = validatedData.insights?.data || [];

      const metrics: PostMetrics = {
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          engagementRate: 0,
        },
        reach: {
          impressions: 0,
          reach: 0,
        },
      };

      // Parse insight data
      for (const insight of insightData) {
        const value = insight.values?.[0]?.value || 0;

        if (insight.name === 'engagement') {
          metrics.engagement.likes = value;
        } else if (insight.name === 'impressions') {
          metrics.reach.impressions = value;
        } else if (insight.name === 'reach') {
          metrics.reach.reach = value;
        } else if (insight.name === 'saved') {
          metrics.engagement.saves = value;
        } else if (insight.name === 'video_views' && validatedData.media_type === 'VIDEO') {
          metrics.video = {
            views: value,
            completionRate: 0,
            averageWatchTime: '00:00',
            watchTime: 0
          };
        } else if (insight.name === 'profile_visits') {
          metrics.reach.profileVisits = value;
        }
      }

      return metrics;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch Instagram insights: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getInstagramMediaInsights',
      });
      throw error;
    }
  }

  /**
   * Get page insights
   */
  static async getPageInsights(
    pageId: string,
    accessToken: string,
    since: Date,
    until: Date
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        fields:
          'insights.metric(page_post_engagements,page_impressions_total,page_views_total,' +
          'page_fan_adds,page_consumptions).since(' +
          Math.floor(since.getTime() / 1000) +
          ').until(' +
          Math.floor(until.getTime() / 1000) +
          ')',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${pageId}?${params.toString()}`);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch page insights: ${errorBody.error?.message || response.statusText}`);
      }

      const rawData = await response.json();
      return MetaPageInsightsResponseSchema.parse(rawData);
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch page insights: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getPageInsights',
      });
      throw error;
    }
  }

  /**
   * Fetch Instagram Reel insights
   */
  static async getReelInsights(
    mediaId: string,
    accessToken: string
  ): Promise<PostMetrics> {
    try {
      const params = new URLSearchParams({
        metric: 'clips_replays_count,ig_reels_avg_watch_time,ig_reels_video_view_total_time,plays,reach,shares,total_interactions',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${mediaId}/insights?${params.toString()}`);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch Reel insights: ${errorBody.error?.message || response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = MetaReelInsightsResponseSchema.parse(rawData);
      const insightData = validatedData.data;

      const metrics: PostMetrics = {
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          engagementRate: 0,
        },
        reach: {
          impressions: 0,
          reach: 0,
        },
      };

      for (const insight of insightData) {
        const value = insight.values?.[0]?.value || 0;

        if (insight.name === 'plays') {
          if (!metrics.video) metrics.video = { views: value, completionRate: 0, averageWatchTime: '0s', watchTime: 0 };
          else metrics.video.views = value;
        }
        if (insight.name === 'reach') {
          metrics.reach.reach = value;
        }
        if (insight.name === 'shares') {
          metrics.engagement.shares = value;
        }
        if (insight.name === 'total_interactions') {
          metrics.engagement.likes = value; // Approximating interactions as likes if more detail not available
        }
        if (insight.name === 'ig_reels_avg_watch_time') {
          if (!metrics.video) metrics.video = { views: 0, completionRate: 0, averageWatchTime: `${value}s`, watchTime: 0 };
          else metrics.video.averageWatchTime = `${value}s`;
        }
      }

      return metrics;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch Reel insights: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getReelInsights',
      });
      throw error;
    }
  }

  /**
   * Get story insights (24-hour window)
   */
  static async getStoryInsights(
    storyId: string,
    accessToken: string
  ): Promise<PostMetrics> {
    try {
      const params = new URLSearchParams({
        fields:
          'id,story_type,' +
          'insights.metric(story_impressions,story_interactions,story_taps,story_exits,story_replies).period(lifetime)',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/${storyId}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch story insights');
      }

      const rawData = await response.json();
      const metrics: PostMetrics = {
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          engagementRate: 0,
        },
        reach: {
          impressions: 0,
          reach: 0,
        },
        story: {
          impressions: 0,
          replies: 0,
          exits: 0,
          navigateAway: 0,
          navigateToProfile: 0,
          taps: 0,
          shares: 0,
        }
      };

      const insights = rawData.insights?.data || [];
      for (const insight of insights) {
        const value = insight.values?.[0]?.value || 0;

        if (insight.name === 'story_impressions') {
          metrics.reach.impressions = value;
          if (metrics.story) metrics.story.impressions = value;
        } else if (insight.name === 'story_interactions') {
          metrics.engagement.likes = value;
        } else if (insight.name === 'story_replies') {
          metrics.engagement.comments = value;
          if (metrics.story) metrics.story.replies = value;
        } else if (insight.name === 'story_exits') {
          if (metrics.story) metrics.story.exits = value;
        } else if (insight.name === 'story_taps') {
          if (metrics.story) metrics.story.taps = value;
        }
      }

      return metrics;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch story insights: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getStoryInsights',
      });
      throw error;
    }
  }

  // ============================================================================
  // Account Management
  // ============================================================================

  /**
   * Get connected pages for a user
   */
  static async getUserPages(accessToken: string): Promise<MetaPageInfo[]> {
    try {
      const params = new URLSearchParams({
        fields: 'id,name,picture.width(200).height(200),link,category,instagram_business_account',
        access_token: accessToken,
      });

      const response = await fetch(`${this.BASE_URL}/me/accounts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();

      return data.data.map((page: any) => ({
        id: page.id,
        name: page.name,
        picture: page.picture?.data?.url,
        link: page.link,
        category: page.category,
        instagramBusinessAccountId: page.instagram_business_account?.id,
      }));
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch user pages: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getUserPages',
      });
      throw error;
    }
  }

  /**
   * Get creator account information
   */
  static async getCreatorAccountInfo(
    instagramUserId: string,
    accessToken: string
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        fields:
          'id,username,name,biography,followers_count,' +
          'follows_count,ig_media_count,profile_picture_url',
        access_token: accessToken,
      });

      const response = await fetch(
        `${this.BASE_URL}/${instagramUserId}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch creator account info');
      }

      return await response.json();
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch creator account info: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.getCreatorAccountInfo',
      });
      throw error;
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(
    postId: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${postId}?${new URLSearchParams({
          access_token: accessToken,
        }).toString()}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      return true;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to delete post: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.deletePost',
      });
      throw error;
    }
  }

  // ============================================================================
  // Webhook Management
  // ============================================================================

  /**
   * Subscribe to webhook events
   */
  static async subscribeToWebhook(
    pageId: string,
    accessToken: string,
    webhookUrl: string
  ): Promise<boolean> {
    try {
      const payload = {
        subscribed_fields: [
          'feed',
          'comments',
          'mentions',
          'message_echoes',
          'messaging_postbacks',
        ].join(','),
        webhook_url: webhookUrl,
        verify_token: this.WEBHOOK_TOKEN,
        access_token: accessToken,
      };

      const response = await fetch(`${this.BASE_URL}/${pageId}/subscribed_apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload as any).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to webhook');
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to subscribe to webhook: ${error}`,
        source: 'MetaBusinessManager',
        context: 'MetaBusinessManager.subscribeToWebhook',
      });
      throw error;
    }
  }

  /**
   * Verify webhook token
   */
  static verifyWebhookToken(token: string): boolean {
    return token === this.WEBHOOK_TOKEN;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Check if platform is Meta (Facebook/Instagram/Creator)
   */
  static isMetaPlatform(platform: Platform): boolean {
    return ([Platform.FACEBOOK, Platform.INSTAGRAM] as Platform[]).includes(platform);
  }

  /**
   * Get platform-specific API endpoint
   */
  static getPlatformEndpoint(platform: Platform): string {
    const basePath = `${this.BASE_URL}`;

    switch (platform) {
      case Platform.FACEBOOK:
        return `${basePath}/feed`;
      case Platform.INSTAGRAM:
        return `${basePath}/ig_hashtag_search`;
      default:
        return basePath;
    }
  }
}
