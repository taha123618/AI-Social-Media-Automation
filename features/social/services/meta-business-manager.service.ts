import { SocialMediaService } from './social.service';
import { Platform } from '@/app/generated/prisma/client';
import { SystemLogger } from '@/features/system/services/logger.service';
import prisma from '@/lib/prisma';

export interface MetaCredentials {
  accessToken: string;
  pageId?: string;
  instagramAccountId?: string;
  expiresAt?: Date;
}

export interface MetaPostData {
  message: string;
  mediaUrls?: string[];
  published?: boolean;
  scheduledPublishTime?: string;
  contentType?: 'POST' | 'REEL' | 'STORY';
}

export interface MetaInsights {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  profileVisits?: number;
  videoViews?: number;
  videoCompletionRate?: number;
}

export class MetaBusinessManagerService {
  private static readonly BASE_URL = 'https://graph.facebook.com/v19.0';

  /**
   * Get Meta credentials using SocialMediaService pattern
   */
  private static async getMetaCredentials(businessId: string, platform: Platform) {
    const [account, service] = await Promise.all([
      prisma.socialAccount.findFirst({
        where: { businessId, platform: platform as any, isActive: true }
      }),
      prisma.thirdPartyService.findFirst({
        where: { businessId, platform: platform as any, isActive: true }
      })
    ]);

    if (!account) {
      throw new Error(`No connected ${platform} account found for business ${businessId}`);
    }

    return {
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      expiresAt: account.tokenExpiresAt,
      pageId: account.platformId,
      instagramAccountId: platform === Platform.INSTAGRAM ? account.platformId : undefined,
      apiKey: service?.apiKey,
      apiSecret: service?.apiSecret,
    };
  }

  // Required Scopes for different features
  static readonly REQUIRED_SCOPES = {
    BASIC: [
      'public_profile',
      'pages_show_list',
      'pages_read_engagement'
    ],
    PUBLISHING: [
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish'
    ],
    INSIGHTS: [
      'pages_read_insights',
      'instagram_basic'
    ],
    BUSINESS_MANAGER: [
      'business_management',
      'pages_manage_metadata'
    ]
  };

  static readonly PERMISSIONS = {
    FACEBOOK_PAGE: {
      tasks: [
        'MANAGE_CONTENT',
        'MODERATE_CONTENT',
        'CREATE_CONTENT',
        'READ_INSIGHTS',
        'PUBLISH_CONTENT'
      ]
    },
    INSTAGRAM_BUSINESS: {
      tasks: [
        'CONTENT_PUBLISH',
        'ANALYZE',
        'MANAGE'
      ]
    }
  };

  /**
   * Get Facebook Page posts with insights
   */
  static async getFacebookPagePosts(
    pageId: string,
    accessToken: string,
    limit: number = 25
  ) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${pageId}/posts?` +
        `fields=id,message,created_time,permalink_url,` +
        `insights.metric(post_impressions,post_clicks,post_reactions_total,post_shares,total_video_views)` +
        `&limit=${limit}&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Facebook API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch Facebook posts: ${error}`,
        source: 'MetaBusinessManagerService.getFacebookPagePosts',
        context: { pageId }
      });
      throw error;
    }
  }

  /**
   * Get Instagram Business posts with insights
   */
  static async getInstagramPosts(
    instagramAccountId: string,
    accessToken: string,
    limit: number = 25
  ) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${instagramAccountId}/media?` +
        `fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,` +
        `insights.metric(impressions,reach,likes,comments,shares,saves,video_views)` +
        `&limit=${limit}&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch Instagram posts: ${error}`,
        source: 'MetaBusinessManagerService.getInstagramPosts',
        context: { instagramAccountId }
      });
      throw error;
    }
  }

  /**
   * Publish content to Facebook Page using SocialMediaService integration
   */
  static async publishToFacebookPage(
    businessId: string,
    postData: MetaPostData
  ) {
    try {
      // Use SocialMediaService for unified publishing
      const result = await SocialMediaService.publishInfo(
        businessId,
        Platform.FACEBOOK,
        postData.message,
        postData.mediaUrls || []
      );

      await SystemLogger.logActivity({
        action: "FACEBOOK_POST_PUBLISHED",
        entity: "SocialPost",
        details: { businessId, postId: result.postId, contentType: postData.contentType }
      });

      return result;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to publish to Facebook: ${error}`,
        source: 'MetaBusinessManagerService.publishToFacebookPage',
        context: { businessId, contentType: postData.contentType }
      });
      throw error;
    }
  }

  /**
   * Publish content to Facebook Page (direct API method)
   */
  static async publishToFacebookPageDirect(
    pageId: string,
    postData: MetaPostData,
    accessToken: string
  ) {
    try {
      const url = `${this.BASE_URL}/${pageId}/feed`;
      const formData = new FormData();

      formData.append('message', postData.message);
      formData.append('access_token', accessToken);
      formData.append('published', postData.published?.toString() || 'true');

      // Handle media attachments
      if (postData.mediaUrls && postData.mediaUrls.length > 0) {
        if (postData.contentType === 'REEL') {
          // For Reels, upload video first
          const videoResponse = await this.uploadVideoToFacebook(pageId, postData.mediaUrls[0], accessToken);
          formData.append('attached_media', `{"media_fbid":"${videoResponse.id}"}`);
        } else if (postData.mediaUrls.length === 1) {
          // Single image
          formData.append('source', postData.mediaUrls[0]);
        } else {
          // Multiple images - create carousel
          const mediaIds = await Promise.all(
            postData.mediaUrls.map(url => this.uploadPhotoToFacebook(pageId, url, accessToken))
          );
          formData.append('attached_media', JSON.stringify(mediaIds.map(id => ({ media_fbid: id }))));
        }
      }

      // Schedule post if needed
      if (postData.scheduledPublishTime) {
        formData.append('scheduled_publish_time', postData.scheduledPublishTime);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook Publishing Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();

      await SystemLogger.logActivity({
        action: "FACEBOOK_POST_PUBLISHED",
        entity: "SocialPost",
        details: { pageId, postId: result.id, contentType: postData.contentType }
      });

      return result;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to publish to Facebook: ${error}`,
        source: 'MetaBusinessManagerService.publishToFacebookPage',
        context: { pageId, contentType: postData.contentType }
      });
      throw error;
    }
  }

  /**
   * Publish content to Instagram using SocialMediaService integration
   */
  static async publishToInstagram(
    businessId: string,
    postData: MetaPostData
  ) {
    try {
      // Use SocialMediaService for unified publishing
      const result = await SocialMediaService.publishInfo(
        businessId,
        Platform.INSTAGRAM,
        postData.message,
        postData.mediaUrls || []
      );

      await SystemLogger.logActivity({
        action: "INSTAGRAM_POST_PUBLISHED",
        entity: "SocialPost",
        details: { businessId, postId: result.postId, contentType: postData.contentType }
      });

      return result;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to publish to Instagram: ${error}`,
        source: 'MetaBusinessManagerService.publishToInstagram',
        context: { businessId, contentType: postData.contentType }
      });
      throw error;
    }
  }

  /**
   * Publish content to Instagram Business (direct API method)
   */
  static async publishToInstagramDirect(
    instagramAccountId: string,
    postData: MetaPostData,
    accessToken: string
  ) {
    try {
      // Step 1: Create media container
      const containerData = await this.createInstagramMediaContainer(
        instagramAccountId,
        postData,
        accessToken
      );

      // Step 2: Publish the media container
      const publishResponse = await fetch(
        `${this.BASE_URL}/${instagramAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accessToken
          })
        }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(`Instagram Publishing Error: ${errorData.error?.message || publishResponse.statusText}`);
      }

      const result = await publishResponse.json();

      await SystemLogger.logActivity({
        action: "INSTAGRAM_POST_PUBLISHED",
        entity: "SocialPost",
        details: { instagramAccountId, postId: result.id, contentType: postData.contentType }
      });

      return result;
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to publish to Instagram: ${error}`,
        source: 'MetaBusinessManagerService.publishToInstagram',
        context: { instagramAccountId, contentType: postData.contentType }
      });
      throw error;
    }
  }

  /**
   * Create Instagram media container
   */
  private static async createInstagramMediaContainer(
    instagramAccountId: string,
    postData: MetaPostData,
    accessToken: string
  ) {
    const containerData: any = {
      media_type: postData.contentType === 'REEL' ? 'REELS' : 'CAROUSEL',
      caption: postData.message,
      access_token: accessToken
    };

    if (postData.mediaUrls && postData.mediaUrls.length > 0) {
      if (postData.contentType === 'REEL') {
        // For Reels, upload video first
        const videoUrl = await this.uploadVideoToInstagram(instagramAccountId, postData.mediaUrls[0], accessToken);
        containerData.video_url = videoUrl;
      } else {
        // For posts and stories, handle images
        if (postData.mediaUrls.length === 1) {
          const imageUrl = await this.uploadPhotoToInstagram(instagramAccountId, postData.mediaUrls[0], accessToken);
          containerData.image_url = imageUrl;
        } else {
          // Multiple images for carousel
          const children = await Promise.all(
            postData.mediaUrls.map(url => this.uploadPhotoToInstagram(instagramAccountId, url, accessToken))
          );
          containerData.children = children;
        }
      }
    }

    const response = await fetch(
      `${this.BASE_URL}/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Instagram Container Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Upload photo to Facebook
   */
  private static async uploadPhotoToFacebook(
    pageId: string,
    photoUrl: string,
    accessToken: string
  ) {
    const response = await fetch(
      `${this.BASE_URL}/${pageId}/photos`,
      {
        method: 'POST',
        body: JSON.stringify({
          url: photoUrl,
          access_token: accessToken,
          published: false
        })
      }
    );

    const data = await response.json();
    return data.id;
  }

  /**
   * Upload video to Facebook
   */
  private static async uploadVideoToFacebook(
    pageId: string,
    videoUrl: string,
    accessToken: string
  ) {
    const response = await fetch(
      `${this.BASE_URL}/${pageId}/videos`,
      {
        method: 'POST',
        body: JSON.stringify({
          file_url: videoUrl,
          access_token: accessToken,
          published: false
        })
      }
    );

    const data = await response.json();
    return data.id;
  }

  /**
   * Upload photo to Instagram
   */
  private static async uploadPhotoToInstagram(
    instagramAccountId: string,
    photoUrl: string,
    accessToken: string
  ) {
    const response = await fetch(
      `${this.BASE_URL}/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: photoUrl,
          access_token: accessToken,
          media_type: 'IMAGE'
        })
      }
    );

    const data = await response.json();
    return data.id;
  }

  /**
   * Upload video to Instagram
   */
  private static async uploadVideoToInstagram(
    instagramAccountId: string,
    videoUrl: string,
    accessToken: string
  ) {
    const response = await fetch(
      `${this.BASE_URL}/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          access_token: accessToken,
          media_type: 'REELS'
        })
      }
    );

    const data = await response.json();
    return data.id;
  }

  /**
   * Get comprehensive insights for a post
   */
  static async getPostInsights(
    postId: string,
    platform: 'FACEBOOK' | 'INSTAGRAM',
    accessToken: string
  ): Promise<MetaInsights> {
    try {
      let insightsUrl: string;
      let metrics: string[];

      if (platform === 'FACEBOOK') {
        insightsUrl = `${this.BASE_URL}/${postId}/insights`;
        metrics = [
          'post_impressions',
          'post_clicks',
          'post_reactions_total',
          'post_shares',
          'post_video_views',
          'post_video_avg_time_watched'
        ];
      } else {
        insightsUrl = `${this.BASE_URL}/${postId}/insights`;
        metrics = [
          'impressions',
          'reach',
          'likes',
          'comments',
          'shares',
          'saves',
          'video_views',
          'video_completion_rate'
        ];
      }

      const response = await fetch(
        `${insightsUrl}?metric=${metrics.join(',')}&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Insights API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const insights = data.data || [];

      return this.parseInsights(insights, platform);
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch post insights: ${error}`,
        source: 'MetaBusinessManagerService.getPostInsights',
        context: { postId, platform }
      });
      throw error;
    }
  }

  /**
   * Parse insights data into standardized format
   */
  private static parseInsights(insights: any[], platform: 'FACEBOOK' | 'INSTAGRAM'): MetaInsights {
    const result: MetaInsights = {
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      reach: 0,
      impressions: 0,
    };

    insights.forEach(insight => {
      const value = insight.values?.[0]?.value || 0;

      switch (insight.name) {
        case 'post_reactions_total':
        case 'likes':
          result.likes = value;
          break;
        case 'post_comments':
        case 'comments':
          result.comments = value;
          break;
        case 'post_shares':
        case 'shares':
          result.shares = value;
          break;
        case 'saves':
          result.saves = value;
          break;
        case 'post_impressions':
        case 'impressions':
          result.impressions = value;
          break;
        case 'post_clicks':
          result.profileVisits = value;
          break;
        case 'reach':
          result.reach = value;
          break;
        case 'post_video_views':
        case 'video_views':
          result.videoViews = value;
          break;
        case 'video_completion_rate':
        case 'post_video_avg_time_watched':
          result.videoCompletionRate = value;
          break;
      }
    });

    return result;
  }

  /**
   * Get story insights (limited time window)
   */
  static async getStoryInsights(
    storyId: string,
    accessToken: string
  ): Promise<MetaInsights> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${storyId}/insights?` +
        `metric=impressions,reach,replies,taps_forward,taps_back&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Story Insights Error: ${response.statusText}`);
      }

      const data = await response.json();
      const insights = data.data || [];

      return {
        likes: 0,
        comments: insights.find((i: any) => i.name === 'replies')?.values?.[0]?.value || 0,
        shares: 0,
        saves: 0,
        reach: insights.find((i: any) => i.name === 'reach')?.values?.[0]?.value || 0,
        impressions: insights.find((i: any) => i.name === 'impressions')?.values?.[0]?.value || 0,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch story insights: ${error}`,
        source: 'MetaBusinessManagerService.getStoryInsights',
        context: { storyId }
      });
      throw error;
    }
  }

  /**
   * Validate required permissions for Meta Business Manager
   */
  static validatePermissions(permissions: string[], requiredScopes: string[]): boolean {
    return requiredScopes.every(scope => permissions.includes(scope));
  }

  /**
   * Get business manager pages and Instagram accounts using SocialMediaService
   */
  static async getBusinessAccounts(businessId: string) {
    try {
      // Get Facebook and Instagram accounts using SocialMediaService pattern
      const [facebookAccount, instagramAccount] = await Promise.all([
        prisma.socialAccount.findFirst({
          where: { businessId, platform: Platform.FACEBOOK as any, isActive: true }
        }),
        prisma.socialAccount.findFirst({
          where: { businessId, platform: Platform.INSTAGRAM as any, isActive: true }
        })
      ]);

      return {
        facebookPages: facebookAccount ? [{
          id: facebookAccount.platformId,
          name: facebookAccount.name || 'Facebook Page',
          access_token: facebookAccount.accessToken
        }] : [],
        instagramAccount: instagramAccount ? {
          id: instagramAccount.platformId,
          username: instagramAccount.name || 'Instagram Account'
        } : null
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch business accounts: ${error}`,
        source: 'MetaBusinessManagerService.getBusinessAccounts',
        context: { businessId }
      });
      throw error;
    }
  }

  /**
   * Get business manager pages and Instagram accounts (direct API method)
   */
  static async getBusinessAccountsDirect(accessToken: string) {
    try {
      const [pagesResponse, instagramResponse] = await Promise.all([
        fetch(`${this.BASE_URL}/me/accounts?access_token=${accessToken}`),
        fetch(`${this.BASE_URL}/me?fields=instagram_business_account&access_token=${accessToken}`)
      ]);

      const pagesData = await pagesResponse.json();
      const instagramData = await instagramResponse.json();

      return {
        facebookPages: pagesData.data || [],
        instagramAccount: instagramData.instagram_business_account
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch business accounts: ${error}`,
        source: 'MetaBusinessManagerService.getBusinessAccounts'
      });
      throw error;
    }
  }
}
