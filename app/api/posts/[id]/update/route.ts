/**
 * PATCH /api/posts/[id]/update
 * Update a post draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import type { InputJsonValue } from '@prisma/client/runtime/client';
import {
  UpdatePostDraftRequest,
  PostDraftResponse,
  PostErrorCode,
  ApiResponse,
} from '@/features/social/types/social-posting.types';

export async function PATCH(
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

    const body = (await req.json()) as UpdatePostDraftRequest;
    const { id: draftId } = await params;

    // Get existing draft
    const existingDraft = await prisma.contentDraft.findFirst({
      where: {
        id: draftId,
        businessId,
      },
    });

    if (!existingDraft) {
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.DRAFT_NOT_FOUND, message: 'Draft not found' } } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Check if already posted
    if (existingDraft.postedAt) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Cannot edit published posts' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Update draft
    const updatedDraft = await prisma.contentDraft.update({
      where: { id: draftId },
      data: {
        contentJson: (body.contentJson || existingDraft.contentJson) as InputJsonValue,
        mediaUrl: body.mediaUrls?.[0] || existingDraft.mediaUrl,
        scheduledFor: body.scheduledFor !== undefined ? body.scheduledFor : existingDraft.scheduledFor,
        platforms: body.platforms || existingDraft.platforms,
        status: body.status || existingDraft.status,
        updatedAt: new Date(),
      },
    });

    await SystemLogger.logInfo({
      message: 'Post draft updated',
      context: {
        source: 'PATCH /api/posts/[id]/update',
        draftId: updatedDraft.id,
      },
    });

    const response: PostDraftResponse = {
      id: updatedDraft.id,
      title: updatedDraft.title || undefined,
      content: (updatedDraft.contentJson as unknown as PostDraftResponse['content']) || {},
      platforms: updatedDraft.platforms as unknown as PostDraftResponse['platforms'],
      status: updatedDraft.status as unknown as PostDraftResponse['status'],
      createdAt: updatedDraft.createdAt,
      updatedAt: updatedDraft.updatedAt,
      scheduledFor: updatedDraft.scheduledFor || undefined,
    };

    return NextResponse.json({ success: true, data: response, timestamp: new Date() });
  } catch (error) {
    await SystemLogger.logError({
      message: `Error updating post draft: ${error}`,
      source: 'PATCH /api/posts/[id]/update',
    });

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update post draft' } } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete a post draft
 */
export async function DELETE(
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

    const { id: draftId } = await params;

    // Get existing draft
    const draft = await prisma.contentDraft.findFirst({
      where: {
        id: draftId,
        businessId,
      },
    });

    if (!draft) {
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.DRAFT_NOT_FOUND, message: 'Draft not found' } } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Check if already published
    if (draft.postedAt) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Cannot delete published posts' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Delete draft
    await prisma.contentDraft.delete({
      where: { id: draftId },
    });

    await SystemLogger.logActivity({
      action: 'POST_DRAFT_DELETED',
      entity: 'post',
      entityId: draftId,
      userId: session.user.id,
      details: { businessId },
    });

    return NextResponse.json({ success: true, data: { deleted: true }, timestamp: new Date() });
  } catch (error) {
    await SystemLogger.logError({
      message: `Error deleting post draft: ${error}`,
      source: 'DELETE /api/posts/[id]',
    });

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete post draft' } } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
