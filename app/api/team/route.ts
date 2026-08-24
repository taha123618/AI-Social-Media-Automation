import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SystemLogger } from '@/features/system/services/logger.service';

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
  const existing = await prisma.businessMember.findUnique({
    where: {
      userId_businessId: { userId: targetUser.id, businessId },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User is already a member" },
      { status: 400 }
    );
  }

  // Add member
  const member = await prisma.businessMember.create({
    data: {
      userId: targetUser.id,
      businessId,
      role: body.role,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  await SystemLogger.logActivity({
    action: "TEAM_MEMBER_ADDED",
    entity: "BusinessMember",
    entityId: member.id,
    userId: user.id,
    details: { businessId, targetUserId: targetUser.id, role: body.role }
  });

  return NextResponse.json(member, { status: 201 });
});
