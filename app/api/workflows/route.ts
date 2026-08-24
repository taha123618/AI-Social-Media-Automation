import { NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { ContentStatus } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

export const GET = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const status = (url.searchParams.get('status') || 'PENDING_REVIEW') as ContentStatus;

  const drafts = await prisma.contentDraft.findMany({
    where: {
      businessId,
      status,
    },
    include: {
      business: true,
      creator: { select: { id: true, name: true, email: true } },
      approvals: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { reviewedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ drafts });
});

const actionSchema = z.object({
  action: z.enum(['submit', 'approve', 'reject', 'schedule']),
  comment: z.string().optional(),
  scheduledTime: z.string().optional(),
});

export const POST = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const draftId = new URL(req.url).searchParams.get('draftId');
  if (!draftId) {
    return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
  }

  const body = await parseBody(req, actionSchema);

  const draft = await prisma.contentDraft.findUnique({
    where: { id: draftId, businessId },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  let updatedDraft;

  switch (body.action) {
    case 'submit':
      updatedDraft = await prisma.contentDraft.update({
        where: { id: draftId },
        data: { status: ContentStatus.PENDING_REVIEW },
        include: { approvals: true },
      });
      await SystemLogger.logActivity({
        action: 'DRAFT_SUBMITTED_FOR_REVIEW',
        entity: 'ContentDraft',
        entityId: draftId,
        userId: user.id,
        details: { businessId },
      });
      break;

    case 'approve':
      await prisma.approvalLog.create({
        data: {
          draftId,
          userId: user.id,
          status: ContentStatus.APPROVED,
          comment: body.comment,
        },
      });
      updatedDraft = await prisma.contentDraft.update({
        where: { id: draftId },
        data: { status: ContentStatus.APPROVED },
        include: { approvals: true },
      });
      await SystemLogger.logAudit({
        action: 'CONTENT_APPROVED',
        resource: 'ContentDraft',
        status: 'SUCCESS',
        userId: user.id,
        details: { draftId, businessId, comment: body.comment },
      });
      break;

    case 'reject':
      await prisma.approvalLog.create({
        data: {
          draftId,
          userId: user.id,
          status: ContentStatus.REJECTED,
          comment: body.comment || 'No reason provided',
        },
      });
      updatedDraft = await prisma.contentDraft.update({
        where: { id: draftId },
        data: { status: ContentStatus.REJECTED },
        include: { approvals: true },
      });
      await SystemLogger.logAudit({
        action: 'CONTENT_REJECTED',
        resource: 'ContentDraft',
        status: 'SUCCESS',
        userId: user.id,
        details: { draftId, businessId, comment: body.comment },
      });
      break;

    case 'schedule':
      if (!body.scheduledTime) {
        return NextResponse.json(
          { error: "Scheduled time required" },
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
      updatedDraft = await prisma.contentDraft.update({
        where: { id: draftId },
        data: {
          status: ContentStatus.SCHEDULED,
          scheduledFor: scheduledDate,
        },
        include: { approvals: true },
      });
      await SystemLogger.logActivity({
        action: 'CONTENT_SCHEDULED',
        entity: 'ContentDraft',
        entityId: draftId,
        userId: user.id,
        details: { businessId, scheduledTime: body.scheduledTime },
      });
      break;

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json(updatedDraft);
});
