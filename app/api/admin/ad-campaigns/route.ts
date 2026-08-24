import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/ad-campaigns
 * Returns all campaigns across all businesses — admin access only.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const platformFilter = searchParams.get('platform');
    const businessIdFilter = searchParams.get('businessId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200);

    const campaigns = await prisma.campaign.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter as any } : {}),
        ...(platformFilter ? { platform: platformFilter as any } : {}),
        ...(businessIdFilter ? { businessId: businessIdFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        platform: true,
        objective: true,
        status: true,
        dailyBudget: true,
        lifetimeBudget: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        businessId: true,
        business: {
          select: { id: true, name: true },
        },
        adSets: {
          select: {
            id: true,
            _count: { select: { ads: true } },
          },
        },
        _count: {
          select: { adSets: true, adAnalytics: true },
        },
      },
    });

    // Summary stats for the admin dashboard
    const [totalActive, totalDraft, totalMeta, totalGoogle] = await Promise.all([
      prisma.campaign.count({ where: { status: 'ACTIVE' as any } }),
      prisma.campaign.count({ where: { status: 'DRAFT' as any } }),
      prisma.campaign.count({ where: { platform: 'META' as any } }),
      prisma.campaign.count({ where: { platform: 'GOOGLE' as any } }),
    ]);

    return NextResponse.json({
      campaigns,
      stats: {
        total: await prisma.campaign.count(),
        active: totalActive,
        draft: totalDraft,
        meta: totalMeta,
        google: totalGoogle,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/admin/ad-campaigns]', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/ad-campaigns
 * Allows admins to update the status of any campaign (e.g. force-pause, approve).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, status } = body;

    if (!campaignId || !status) {
      return NextResponse.json({ error: 'campaignId and status are required' }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
      select: { id: true, name: true, status: true },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error('[PATCH /api/admin/ad-campaigns]', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}
