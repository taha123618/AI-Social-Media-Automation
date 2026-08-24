import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SystemLogger } from '@/features/system/services/logger.service';

const postSchema = z.object({
  draftId: z.string(),
  content: z.string(),
  parentId: z.string().optional(),
});

export const GET = apiHandler(async (req, { user }) => {
  const url = new URL(req.url);
  const draftId = url.searchParams.get('draftId');

  if (!draftId) {
    return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
  }

  const comments = await prisma.draftComment.findMany({
    where: { 
      draftId,
      parentId: null // Only fetch root comments, replies will be included
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return NextResponse.json(comments);
});

export const POST = apiHandler(async (req, { user }) => {
  const body = await parseBody(req, postSchema);

  const comment = await prisma.draftComment.create({
    data: {
      content: body.content,
      draftId: body.draftId,
      authorId: user.id,
      parentId: body.parentId || null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      }
    }
  });

  await SystemLogger.logActivity({
    action: 'COMMENT_ADDED',
    entity: 'DraftComment',
    entityId: comment.id,
    userId: user.id,
    details: { draftId: body.draftId, parentId: body.parentId },
  });

  return NextResponse.json(comment, { status: 201 });
});

export const DELETE = apiHandler(async (req, { user }) => {
  const url = new URL(req.url);
  const commentId = url.searchParams.get('id');

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
  }

  // Check if user is the author
  const existingComment = await prisma.draftComment.findUnique({
    where: { id: commentId },
    select: { authorId: true }
  });

  if (!existingComment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (existingComment.authorId !== user.id) {
    return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
  }

  await prisma.draftComment.delete({
    where: { id: commentId }
  });

  return NextResponse.json({ success: true });
});
