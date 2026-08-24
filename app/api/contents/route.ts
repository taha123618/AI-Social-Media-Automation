import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { ContentStatus, Platform, ContentIntent } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

const listSchema = z.object({
  skip: z.number().default(0),
  take: z.number().default(10),
  status: z.string().optional(),
  platform: z.string().optional(),
  intent: z.string().optional(),
});

export const GET = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get('skip') || '0');
  const take = parseInt(url.searchParams.get('take') || '10');
  const status = url.searchParams.get('status');
  const platform = url.searchParams.get('platform');
  const intent = url.searchParams.get('intent');

  // Build filter
  const where: any = { businessId };
  if (status) {
    where.status = status as ContentStatus;
  } else {
    // Default: exclude POSTED items and those with already published posts
    where.status = { not: ContentStatus.POSTED };
  }
  where.posts = { none: { status: ContentStatus.POSTED } };


  if (platform) where.platforms = { hasSome: [platform as Platform] };
  if (intent) where.intent = intent as ContentIntent;

  const [drafts, total] = await Promise.all([
    prisma.contentDraft.findMany({
      where,
      include: {
        business: true,
        creator: { select: { id: true, name: true, email: true } },
        approvals: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.contentDraft.count({ where }),
  ]);

  return NextResponse.json({
    drafts,
    total,
    page: Math.floor(skip / take) + 1,
    totalPages: Math.ceil(total / take),
  });
});

const createSchema = z.object({
  intent: z.string(),
  platforms: z.array(z.string()),
  topic: z.string().optional(),
  customInstructions: z.string().optional(),
});

export const POST = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const body = await parseBody(req, createSchema);

  // Call generation API
  const generationRes = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.id}`,
      'x-business-id': businessId,
    },
    body: JSON.stringify(body),
  });

  if (!generationRes.ok) {
    await SystemLogger.logError({
      message: 'Content generation failed via API',
      source: 'API /api/contents',
      path: '/api/contents',
      context: { businessId, intent: body.intent, status: generationRes.status },
    });
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: generationRes.status }
    );
  }

  const draft = await generationRes.json();

  await SystemLogger.logActivity({
    action: 'CONTENT_GENERATED',
    entity: 'ContentDraft',
    entityId: draft.id,
    userId: user.id,
    details: { businessId, intent: body.intent, platforms: body.platforms },
  });

  return NextResponse.json(draft, { status: 201 });
});
