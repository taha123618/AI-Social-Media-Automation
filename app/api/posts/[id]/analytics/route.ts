/**
 * GET /api/posts/[id]/analytics
 * Fetch analytics for a published post
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import {
  PostAnalyticsResponse,
  PostMetrics,
  PostErrorCode,
  ApiResponse,
} from '@/features/social/types/social-posting.types';
import { Platform } from '@/app/generated/prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.AUTHENTICATION_FAILED, message: 'Unauthorized' } } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_HEADER', message: 'Business ID required' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const { id: postId } = await params;

    // Get post with analytics and related data
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        businessId,
      },
      include: {
        socialAccount: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.POST_NOT_FOUND, message: 'Post not found' } } as ApiResponse<null>,
        { status: 404 }
      );
    }

    if (!post.externalPostId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Post has no external ID' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    try {
      // Refresh token if needed
      const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(
        post.socialAccount
      );

      let metrics: PostMetrics = {
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

      // Fetch metrics based on platform
      if (post.platform === Platform.FACEBOOK) {
        metrics = await MetaBusinessManagerService.getFacebookPostInsights(
          post.externalPostId,
          accessToken
        );
      } else if (post.platform === Platform.INSTAGRAM) {
        metrics = await MetaBusinessManagerService.getInstagramMediaInsights(
          post.externalPostId,
          accessToken
        );
      }

      // Update stored metrics directly on the Post
      await prisma.post.update({
        where: { id: post.id },
        data: {
          likes: metrics.engagement?.likes || 0,
          comments: metrics.engagement?.comments || 0,
          shares: metrics.engagement?.shares || 0,
          saves: metrics.engagement?.saves || 0,
          impressions: metrics.reach?.impressions || 0,
          videoViews: metrics.video?.views || 0,
          videoCompletionRate: metrics.video?.completionRate,
          analyticsUpdatedAt: new Date(),
        },
      });

      const response: PostAnalyticsResponse = {
        postId: post.id,
        platform: post.platform,
        externalPostId: post.externalPostId,
        publishedAt: post.postedAt || new Date(),
        metrics,
      };

      return NextResponse.json({ success: true, data: response, timestamp: new Date() });
    } catch (error) {
      // Return stored analytics from the Post even if fetch fails
      const response: PostAnalyticsResponse = {
        postId: post.id,
        platform: post.platform,
        externalPostId: post.externalPostId,
        publishedAt: post.postedAt || new Date(),
        metrics: {
          engagement: {
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            saves: post.saves,
            engagementRate:
              post.impressions > 0
                ? ((post.likes + post.comments + post.shares) / post.impressions) * 100
                : 0,
          },
          reach: {
            impressions: post.impressions,
            reach: post.reach,
          },
          video: post.videoViews
            ? {
              views: post.videoViews,
              completionRate: post.videoCompletionRate || 0,
              averageWatchTime: '00:00',
              watchTime: 0,
            }
            : undefined,
          click: {
            linkClicks: post.clicks,
            websiteClicks: post.websiteClicks,
            bookingClicks: post.bookingClicks,
            messageClicks: post.messageClicks,
            phoneClicks: post.phoneClicks,
          },
        },
      };

      return NextResponse.json({ success: true, data: response, timestamp: new Date() });

      throw error;
    }
  } catch (error) {
    await SystemLogger.logError({
      message: `Error fetching post analytics: ${error}`,
      source: 'GET /api/posts/[id]/analytics',
    });


    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analytics' } } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
