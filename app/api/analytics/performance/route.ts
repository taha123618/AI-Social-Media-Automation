import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';

/**
 * GET /api/analytics/performance
 * Get detailed performance metrics for a business
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const businessId = searchParams.get('businessId');

    const finalBusinessId = businessId || await getActiveWorkspaceIdSafe();

    if (!finalBusinessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Verify access
    const businessMember = await prisma.businessMember.findFirst({
      where: {
        businessId: finalBusinessId,
        userId: session.user.id
      }
    });

    if (!businessMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get daily performance data (now flattened)
    const dailyStats = await prisma.$queryRaw`
      SELECT
        DATE(p.postedAt) as date,
        COUNT(*) as postsCount,
        COALESCE(SUM(p.likes), 0) as totalLikes,
        COALESCE(SUM(p.shares), 0) as totalShares,
        COALESCE(SUM(p.comments), 0) as totalComments,
        COALESCE(SUM(p.impressions), 0) as totalImpressions,
        COALESCE(SUM(p.clicks), 0) as totalClicks
      FROM Post p
      WHERE p.businessId = ${finalBusinessId}
        AND p.postedAt >= ${startDate}
      GROUP BY DATE(p.postedAt)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Get platform and workflow breakdown with analytics
    const postsWithAnalytics = await prisma.post.findMany({
      where: {
        businessId: finalBusinessId,
        postedAt: { gte: startDate }
      },
      include: {
        workflow: {
          select: {
            name: true
          }
        }
      }
    });

    const platformStats = postsWithAnalytics.reduce((acc, post) => {
      const platform = post.platform;
      if (!acc[platform]) {
        acc[platform] = {
          posts: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          impressions: 0,
          clicks: 0
        };
      }

      acc[platform].posts += 1;
      acc[platform].likes += post.likes || 0;
      acc[platform].shares += post.shares || 0;
      acc[platform].comments += post.comments || 0;
      acc[platform].impressions += post.impressions || 0;
      acc[platform].clicks += post.clicks || 0;

      return acc;
    }, {} as Record<string, {
      posts: number;
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
      clicks: number;
    }>);

    const workflowStats = postsWithAnalytics.reduce((acc, post) => {
      const workflowName = post.workflow?.name || 'Manual / One-shot';
      if (!acc[workflowName]) {
        acc[workflowName] = {
          posts: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          impressions: 0,
          clicks: 0
        };
      }

      acc[workflowName].posts += 1;
      acc[workflowName].likes += post.likes || 0;
      acc[workflowName].shares += post.shares || 0;
      acc[workflowName].comments += post.comments || 0;
      acc[workflowName].impressions += post.impressions || 0;
      acc[workflowName].clicks += post.clicks || 0;

      return acc;
    }, {} as Record<string, {
      posts: number;
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
      clicks: number;
    }>);

    // Get top performing content with draft info
    const topContent = await prisma.post.findMany({
      where: {
        businessId: finalBusinessId,
        postedAt: { gte: startDate }
      },
      include: {
        draft: {
          select: {
            contentJson: true
          }
        }
      },
      orderBy: {
        postedAt: 'desc'
      },
      take: 10
    });

    // Post data with direct metrics
    const resultContent = topContent.map(post => ({
      id: post.id,
      title: (post.draft?.contentJson as { title?: string })?.title || 'Untitled',
      platform: post.platform,
      postedAt: post.postedAt,
      metrics: {
        likes: post.likes || 0,
        shares: post.shares || 0,
        comments: post.comments || 0,
        impressions: post.impressions || 0,
        clicks: post.clicks || 0
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        dailyStats,
        platformStats,
        workflowStats,
        topContent: resultContent.sort((a, b) => b.metrics.likes - a.metrics.likes)
      }
    });
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500 }
    );
  }
}
