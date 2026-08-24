/**
 * POST /api/posts/[id]/publish
 * Publish a post to selected social platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import {
  PublishPostRequest,
  PublishPostResponse,
  PostErrorCode,
  ApiResponse,
} from '@/features/social/types/social-posting.types';
import { Platform, ContentStatus } from '@/app/generated/prisma/client';
import { EntitlementGuard } from '@/lib/guards/entitlement.guard';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PostErrorCode.AUTHENTICATION_FAILED,
            message: 'Unauthorized',
            timestamp: new Date(),
          },
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PostErrorCode.AUTHENTICATION_FAILED,
            message: 'Business ID required',
            timestamp: new Date(),
          },
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const body = (await req.json()) as PublishPostRequest;
    const { id: draftId } = await params;

    // Enforce scheduling entitlement if not publishing immediately
    if (!body.publishImmediately) {
      const featureError = await EntitlementGuard.requireFeature(businessId, 'scheduling');
      if (featureError) {
        return featureError;
      }
    }

    // Get draft
    const draft = await prisma.contentDraft.findFirst({
      where: {
        id: draftId,
        businessId,
      },
    });

    if (!draft) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PostErrorCode.DRAFT_NOT_FOUND,
            message: 'Draft not found',
            timestamp: new Date(),
          },
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get social accounts
    const socialAccountIds = body.socialAccountIds || [];
    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: socialAccountIds },
        businessId,
        isActive: true,
      },
    });

    if (socialAccounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PostErrorCode.ACCOUNT_DISCONNECTED,
            message: 'No valid social accounts',
            timestamp: new Date(),
          },
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const postIds: string[] = [];
    const externalPostIds: Record<string, string> = {};
    const publishedUrls: string[] = [];
    const errors: string[] = [];

    // Publish to each platform
    for (const account of socialAccounts) {
      try {
        let result: { postId: string; url: string } | null = null;

        // Refresh token if needed
        const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);

        if (account.platform === Platform.FACEBOOK) {
          result = await MetaBusinessManagerService.publishToFacebook(
            account.platformId,
            accessToken,
            (draft.contentJson as any) || {},
            draft.mediaUrl ? [draft.mediaUrl] : undefined
          );
        } else if (account.platform === Platform.INSTAGRAM) {
          if (!account.platformId) {
            errors.push(`Missing Instagram account ID for ${account.name}`);
            continue;
          }

          const containerResult = await MetaBusinessManagerService.publishToInstagram(
            account.platformId,
            accessToken,
            (draft.contentJson as any) || {},
            draft.mediaUrl ? [draft.mediaUrl] : undefined
          );

          result = {
            postId: containerResult.containerIds[0],
            url: `https://instagram.com/`,
          };
        }

        if (result) {
          // Create Post record
          const post = await prisma.post.create({
            data: {
              businessId,
              creatorId: session.user.id,
              draftId: draft.id,
              socialAccountId: account.id,
              externalPostId: result.postId,
              platform: account.platform,
              publishedUrl: result.url,
              postedAt: body.publishImmediately ? new Date() : undefined,
              status: body.publishImmediately ? ContentStatus.POSTED : ContentStatus.SCHEDULED,
            },
          });

          postIds.push(post.id);
          externalPostIds[account.platform] = result.postId;
          publishedUrls.push(result.url);

          await SystemLogger.logActivity({
            action: 'POST_PUBLISHED',
            entity: 'Post',
            entityId: post.id,
            userId: session.user.id,
            details: { platform: account.platform, postId: result.postId },
          });
        }
      } catch (error) {
        const errorMsg = `Failed to publish to ${account.platform}: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);

        await SystemLogger.logError({
          message: errorMsg,
          source: 'POST /api/posts/[id]/publish',
          context: `Platform: ${account.platform}`,
        });
      }
    }

    if (postIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PostErrorCode.PLATFORM_ERROR,
            message: errors.join(', ') || 'Failed to publish to any platform',
            timestamp: new Date(),
          },
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Update draft status
    await prisma.contentDraft.update({
      where: { id: draft.id },
      data: {
        status: body.publishImmediately ? ContentStatus.POSTED : ContentStatus.SCHEDULED,
        postedAt: body.publishImmediately ? new Date() : undefined,
      },
    });

    const response: PublishPostResponse = {
      success: true,
      postIds,
      externalPostIds,
      publishedUrls,
      status: body.publishImmediately ? 'PUBLISHED' : 'SCHEDULED',
      publishedAt: body.publishImmediately ? new Date() : undefined,
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date(),
    } as ApiResponse<PublishPostResponse>);
  } catch (error) {
    console.error('Error publishing post:', error);
    await SystemLogger.logError({
      message: `Error publishing post: ${error}`,
      source: 'POST /api/posts/[id]/publish',
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: PostErrorCode.PLATFORM_ERROR,
          message: 'Failed to publish post',
          timestamp: new Date(),
        },
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
