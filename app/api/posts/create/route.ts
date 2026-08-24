/**
 * POST /api/posts/create
 * Create a new post draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import {
  CreatePostDraftRequest,
  PostDraftResponse,
  PostErrorCode,
  ApiResponse,
  PostContent,
  SocialPlatform,
} from '@/features/social/types/social-posting.types';
import { ContentStatus, ContentIntent } from '@/app/generated/prisma/client';

export async function POST(req: NextRequest) {
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

    const body = (await req.json()) as CreatePostDraftRequest;

    // Validate required fields
    if (!body.platforms || body.platforms.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.INVALID_CONTENT, message: 'At least one platform required' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!body.socialAccountIds || body.socialAccountIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.INVALID_CONTENT, message: 'At least one social account required' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Verify social accounts belong to business
    const accounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: body.socialAccountIds },
        businessId,
        isActive: true,
      },
    });

    if (accounts.length !== body.socialAccountIds.length) {
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.ACCOUNT_DISCONNECTED, message: 'One or more accounts are invalid or disabled' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Determine status based on scheduledFor date
    let status: ContentStatus = ContentStatus.DRAFT;
    if (body.scheduledFor) {
      const scheduledDate = new Date(body.scheduledFor);
      if (scheduledDate > new Date()) {
        status = ContentStatus.SCHEDULED;
      }
    }

    // Create draft
    const draft = await prisma.contentDraft.create({
      data: {
        title: body.title,
        platforms: body.platforms,
        intent: body.intent || ContentIntent.ENGAGEMENT,
        customPrompt: body.customPrompt,
        contentJson: body.contentJson as PostContent & Record<string, any>,
        mediaUrl: body.mediaUrls?.[0],
        status: status,
        scheduledFor: body.scheduledFor,
        businessId,
        creatorId: session.user.id,
      },
    });

    await SystemLogger.logActivity({
      action: 'POST_DRAFT_CREATED',
      entity: 'post',
      entityId: draft.id,
      userId: session.user.id,
      details: { businessId, platforms: body.platforms },
    });

    const response: PostDraftResponse = {
      id: draft.id,
      title: draft.title || undefined,
      content: (draft.contentJson as PostContent) || {},
      platforms: draft.platforms as SocialPlatform[],
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      scheduledFor: draft.scheduledFor || undefined,
    };

    return NextResponse.json({ success: true, data: response, timestamp: new Date() });
  } catch (error) {
    await SystemLogger.logError({
      message: `Error creating post draft: ${error}`,
      source: 'POST /api/posts/create',
    });

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create post draft' } } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
