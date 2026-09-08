import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SystemLogger } from '@/features/system/services/logger.service';
import { EntitlementGuard } from '@/lib/guards/entitlement.guard';

export const GET = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  // Determine date range for filtering
  let dateRange: { gte: Date; lte: Date };
  if (startDate && endDate) {
    dateRange = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else {
    // Default: next 30 days
    const now = new Date();
    dateRange = {
      gte: now,
      lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  const where: any = {
    businessId,
    // Show both scheduled posts and drafts with future scheduledFor dates
    AND: [
      {
        OR: [
          { status: 'SCHEDULED' },
          {
            status: 'DRAFT',
            scheduledFor: { not: null }
          }
        ]
      },
      {
        scheduledFor: dateRange
      }
    ]
  };

  const scheduledPosts = await prisma.contentDraft.findMany({
    where,
    include: {
      business: true,
      creator: { select: { id: true, name: true, email: true } },
      posts: { include: { socialAccount: true } },
    },
    orderBy: { scheduledFor: 'asc' },
  });

  return NextResponse.json({ scheduledPosts });
});

const scheduleUpdateSchema = z.object({
  draftId: z.string(),
  scheduledTime: z.string(),
});

export const PUT = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  // 1. Enforce Scheduling Feature Entitlement (requires Starter or Pro plan)
  const featureError = await EntitlementGuard.requireFeature(businessId, 'scheduling');
  if (featureError) {
    return featureError;
  }

  const body = await parseBody(req, scheduleUpdateSchema);

  const draft = await prisma.contentDraft.findUnique({
    where: { id: body.draftId, businessId },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  if (draft.status !== 'APPROVED' && draft.status !== 'SCHEDULED') {
    return NextResponse.json(
      { error: "Draft must be approved before scheduling" },
      { status: 400 }
    );
  }

  const scheduledDate = new Date(body.scheduledTime);
  if (scheduledDate <= new Date()) {
    return NextResponse.json(
      { error: "Scheduled time must be in the future" },
      { status: 400 }
    );
  }

  const updated = await prisma.contentDraft.update({
    where: { id: body.draftId },
    data: {
      status: 'SCHEDULED',
      scheduledFor: scheduledDate,
    },
    include: { posts: true },
  });

  await SystemLogger.logActivity({
    action: 'POST_RESCHEDULED',
    entity: 'ContentDraft',
    entityId: body.draftId,
    userId: user.id,
    details: { businessId, newScheduledTime: body.scheduledTime },
  });

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const draftId = url.searchParams.get('draftId');

  if (!draftId) {
    return NextResponse.json({ error: "draftId is required" }, { status: 400 });
  }

  const draft = await prisma.contentDraft.findUnique({
    where: { id: draftId, businessId },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const updated = await prisma.contentDraft.update({
    where: { id: draftId },
    data: {
      status: 'DRAFT',
      scheduledFor: null,
    },
  });

  await SystemLogger.logActivity({
    action: 'POST_UNSCHEDULED',
    entity: 'ContentDraft',
    entityId: draftId,
    userId: user.id,
    details: { businessId },
  });

  return NextResponse.json(updated);
});
