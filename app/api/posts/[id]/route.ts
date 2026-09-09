import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

export const GET = apiHandler(async (req, { businessId }) => {
  const urlParts = req.nextUrl.pathname.split('/');
  const id = urlParts[urlParts.length - 1];

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  const post = await prisma.post.findFirst({
    where: {
      id,
      ...(businessId ? { businessId } : {}),
    },
    include: {
      draft: true,
      socialAccount: { select: { id: true, name: true, avatar: true, platform: true } },
    },
  });

  if (!post) {
    // Check if it's a draft
    const draft = await prisma.contentDraft.findFirst({
      where: {
        id,
        ...(businessId ? { businessId } : {}),
      },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: draft });
  }

  return NextResponse.json({ success: true, data: post });
});

export const DELETE = apiHandler(async (req, { businessId }) => {
  const urlParts = req.nextUrl.pathname.split('/');
  const id = urlParts[urlParts.length - 1];

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  // Check if it's a published post
  const post = await prisma.post.findFirst({
    where: {
      id,
      ...(businessId ? { businessId } : {}),
    },
  });

  if (post) {
    await prisma.post.delete({ where: { id } });
    await SystemLogger.logAudit({
      action: 'DELETE',
      resource: 'posts',
      status: 'SUCCESS',
      details: { postId: id, businessId },
    });
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  }

  // Check if it's a content draft
  const draft = await prisma.contentDraft.findFirst({
    where: {
      id,
      ...(businessId ? { businessId } : {}),
    },
  });

  if (draft) {
    await prisma.contentDraft.delete({ where: { id } });
    await SystemLogger.logAudit({
      action: 'DELETE',
      resource: 'content-drafts',
      status: 'SUCCESS',
      details: { draftId: id, businessId },
    });
    return NextResponse.json({ success: true, message: 'Draft deleted successfully' });
  }

  return NextResponse.json({ error: 'Post or draft not found' }, { status: 404 });
});
