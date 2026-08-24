import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

async function verifyAccess(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  const businessId = req.headers.get('x-business-id');
  if (!businessId) {
    return { error: NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 }) };
  }
  const business = await prisma.business.findFirst({
    where: { id: businessId, members: { some: { userId: session.user.id } } },
    select: { id: true },
  });
  if (!business) {
    return { error: NextResponse.json({ success: false, error: 'Business not found or access denied' }, { status: 403 }) };
  }
  return { businessId, session };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await verifyAccess(req);
    if ('error' in access) return access.error;

    const { id } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, businessId: access.businessId },
      include: {
        adSets: {
          include: {
            ads: {
              include: { adVariants: true },
            },
          },
        },
        launches: { select: { id: true, status: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const analytics = await prisma.adAnalytics.aggregate({
      where: { campaignId: id },
      _sum: { spend: true, revenue: true, impressions: true, clicks: true },
    });

    return NextResponse.json({
      success: true,
      campaign,
      analytics: {
        totalSpend: analytics._sum.spend || 0,
        totalRevenue: analytics._sum.revenue || 0,
        totalImpressions: analytics._sum.impressions || 0,
        totalClicks: analytics._sum.clicks || 0,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/ad-campaigns/[id]]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  objective: z.string().optional(),
  dailyBudget: z.number().positive().optional().nullable(),
  lifetimeBudget: z.number().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'PENDING_REVIEW', 'COMPLETED', 'REJECTED']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await verifyAccess(req);
    if ('error' in access) return access.error;

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.campaign.findFirst({ where: { id, businessId: access.businessId }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const data: any = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.objective !== undefined) data.objective = parsed.data.objective;
    if (parsed.data.dailyBudget !== undefined) data.dailyBudget = parsed.data.dailyBudget;
    if (parsed.data.lifetimeBudget !== undefined) data.lifetimeBudget = parsed.data.lifetimeBudget;
    if (parsed.data.startDate !== undefined) data.startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
    if (parsed.data.endDate !== undefined) data.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;

    const updated = await prisma.campaign.update({
      where: { id },
      data,
      select: { id: true, name: true, objective: true, status: true, dailyBudget: true, startDate: true, endDate: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error('[PATCH /api/ad-campaigns/[id]]', error);
    return NextResponse.json({ success: false, error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await verifyAccess(req);
    if ('error' in access) return access.error;

    const { id } = await params;

    const existing = await prisma.campaign.findFirst({
      where: { id, businessId: access.businessId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Delete analytics first (no cascade), then campaign (cascades adSets -> ads -> variants + campaignLaunches)
    await prisma.adAnalytics.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/ad-campaigns/[id]]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete campaign' }, { status: 500 });
  }
}
