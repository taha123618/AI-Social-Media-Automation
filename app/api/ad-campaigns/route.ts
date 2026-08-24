import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ad-campaigns
 * Returns campaigns for the authenticated user's active business workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    // Verify the user is a member of this business
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        members: { some: { userId: session.user.id } },
      },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found or access denied' }, { status: 403 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
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
        updatedAt: true,
        adSets: {
          select: {
            id: true,
            name: true,
            status: true,
            ads: {
              select: {
                id: true,
                name: true,
                status: true,
                adVariants: {
                  select: {
                    id: true,
                    headline: true,
                    primaryText: true,
                    cta: true,
                    isWinner: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const analytics = await prisma.adAnalytics.aggregate({
      where: { businessId },
      _sum: {
        spend: true,
        revenue: true,
      },
    });

    const totalSpend = analytics._sum.spend || 0;
    const totalRevenue = analytics._sum.revenue || 0;
    const avgRoas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;

    return NextResponse.json({
      success: true,
      campaigns,
      stats: {
        totalSpend,
        avgRoas,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/ad-campaigns]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

/**
 * POST /api/ad-campaigns
 * Creates a campaign with ad sets, ads, and variants in draft state.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        members: { some: { userId: session.user.id } },
      },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found or access denied' }, { status: 403 });
    }

    const body = await req.json();
    const { name, platform, objective, dailyBudget, startDate, endDate, audience, variants } = body;

    const campaign = await prisma.campaign.create({
      data: {
        businessId,
        name: name || `Campaign - ${new Date().toLocaleDateString()}`,
        platform: platform || 'META',
        objective: objective || 'TRAFFIC',
        dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: 'DRAFT',
        adSets: {
          create: [
            {
              name: `Ad Set - ${name || 'Default'}`,
              status: 'DRAFT',
              audience: audience || {},
              dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
              ads: {
                create: [
                  {
                    name: `Ad - ${name || 'Default'}`,
                    status: 'DRAFT',
                    adVariants: {
                      create: (variants || []).map((v: any, index: number) => ({
                        headline: v.headline || 'Headline',
                        primaryText: v.primaryText || 'Primary text',
                        description: v.description || 'Description',
                        cta: v.cta || 'Learn More',
                        imageUrl: v.imageUrl || null,
                        isWinner: index === 0, // default first one as winner/primary variant
                      })),
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        adSets: {
          include: {
            ads: {
              include: {
                adVariants: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('[POST /api/ad-campaigns]', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}

