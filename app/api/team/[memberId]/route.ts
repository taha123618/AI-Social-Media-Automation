import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SystemLogger } from '@/features/system/services/logger.service';

const updateRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']),
});

export const PUT = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const memberId = url.searchParams.get('memberId');

  if (!memberId) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  }

  // Check user is admin/owner
  const userMember = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: user.id, businessId } },
  });

  if (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await parseBody(req, updateRoleSchema);

  const member = await prisma.businessMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.businessId !== businessId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.businessMember.update({
    where: { id: memberId },
    data: { role: body.role },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  await SystemLogger.logActivity({
    action: "TEAM_MEMBER_ROLE_UPDATED",
    entity: "BusinessMember",
    entityId: memberId,
    userId: user.id,
    details: { businessId, oldRole: member.role, newRole: body.role }
  });

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const memberId = url.searchParams.get('memberId');

  if (!memberId) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  }

  // Check user is admin/owner
  const userMember = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: user.id, businessId } },
  });

  if (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const member = await prisma.businessMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.businessId !== businessId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Prevent removing the last owner
  if (member.role === 'OWNER') {
    const otherOwners = await prisma.businessMember.count({
      where: { businessId, role: 'OWNER', id: { not: memberId } },
    });

    if (otherOwners === 0) {
      return NextResponse.json(
        { error: "Cannot remove the last owner" },
        { status: 400 }
      );
    }
  }

  await prisma.businessMember.delete({ where: { id: memberId } });

  await SystemLogger.logActivity({
    action: "TEAM_MEMBER_REMOVED",
    entity: "BusinessMember",
    entityId: memberId,
    userId: user.id,
    details: { businessId, targetUserId: member.userId, role: member.role }
  });

  return NextResponse.json({ success: true });
});
