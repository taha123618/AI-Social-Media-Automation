import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { z } from 'zod';

const OverrideCreateSchema = z.object({
  organizationId: z.string(),
  feature: z.string(),
  enabled: z.boolean().optional(),
  limit: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
  reason: z.string().optional(),
});

/**
 * POST /api/admin/billing/overrides
 * Admin route to grant temporary promotional or custom feature overrides.
 */
export async function POST(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('admin_token')?.value;
    const adminSession = adminToken ? await verifyAdminToken(adminToken) : null;

    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const validated = OverrideCreateSchema.parse(body);

    const override = await prisma.entitlementOverride.create({
      data: {
        organizationId: validated.organizationId,
        feature: validated.feature,
        enabled: validated.enabled,
        limit: validated.limit,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        reason: validated.reason,
      },
    });

    return NextResponse.json({ override }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create entitlement override', message: error?.message },
      { status: 400 }
    );
  }
}
