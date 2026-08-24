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

  // Check user is admin/owner
  const userMember = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: user.id, businessId } },
  });

  if (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const members = await prisma.businessMember.findMany({
    where: { businessId },
    include: {
      user: { select: { id: true, email: true, name: true, image: true } },
    },
    orderBy: { joinedAt: 'desc' },
  });

  return NextResponse.json({ members });
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']),
});

export const POST = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  // 1. Enforce Team Collaboration Entitlement (requires Pro or Enterprise plan)
  const featureError = await EntitlementGuard.requireFeature(businessId, 'team_collaboration');
  if (featureError) {
    return featureError;
  }

  const body = await parseBody(req, inviteSchema);

  // Check user is admin/owner
  const userMember = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: user.id, businessId } },
  });

  if (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Find or create user by email
  let targetUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.email.split('@')[0],
      },
    });
  }

  // Check if already a member
  const existingMember = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: targetUser.id, businessId } },
  });

  if (existingMember) {
    return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 409 });
  }

  // Add member
  const member = await prisma.businessMember.create({
    data: {
      userId: targetUser.id,
      businessId,
      role: body.role,
    },
    include: {
      user: { select: { id: true, email: true, name: true, image: true } },
    },
  });

  await SystemLogger.logActivity({
    action: 'TEAM_MEMBER_INVITED',
    entity: 'BusinessMember',
    entityId: member.id,
    userId: user.id,
    details: { invitedEmail: body.email, role: body.role, businessId },
  });

  return NextResponse.json(member, { status: 201 });
});
