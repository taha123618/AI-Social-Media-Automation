import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  planTier: z.enum(['Free', 'Starter', 'Pro', 'Enterprise']).optional().default('Pro'),
});

export const GET = apiHandler(async (_req, { user }) => {
  const members = await prisma.businessMember.findMany({
    where: { userId: user.id },
    include: {
      business: true,
    },
    orderBy: { joinedAt: 'asc' },
  });

  const workspaces = members.map((m) => ({
    id: m.business.id,
    name: m.business.name,
    role: m.role,
    planTier: 'Pro',
  }));

  return NextResponse.json({
    success: true,
    data: workspaces,
  });
});

export const POST = apiHandler(async (req, { user }) => {
  const body = await parseBody(req, createWorkspaceSchema);
  const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  const business = await prisma.business.create({
    data: {
      name: body.name,
      slug,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: business.id,
      name: business.name,
      role: 'OWNER',
      planTier: body.planTier || 'Pro',
    },
  });
});
