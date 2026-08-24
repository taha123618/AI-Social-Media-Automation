import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';

/**
 * GET /api/analytics/insights
 * Get business insights and AI-powered recommendations
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

    // Get basic metrics from simplified Post model
    const [totalPosts, totalAnalytics] = await Promise.all([
      prisma.post.count({
        where: {
          businessId: finalBusinessId,
          postedAt: { gte: startDate }
        }
      }),
      prisma.post.aggregate({
        where: {
          businessId: finalBusinessId,
          postedAt: { gte: startDate }
        },
        _sum: {
          likes: true,
          shares: true,
          comments: true,
          impressions: true,
          clicks: true
        }
      })
    ]);

    // Calculate engagement rate
    const totalEngagements =
      (totalAnalytics._sum.likes || 0) +
      (totalAnalytics._sum.shares || 0) +
      (totalAnalytics._sum.comments || 0) +
      (totalAnalytics._sum.clicks || 0);

    const engagementRate = totalAnalytics._sum.impressions
      ? ((totalEngagements / totalAnalytics._sum.impressions) * 100).toFixed(2)
      : '0';

    // Get top performing posts from simplified Post model
    const topPosts = await prisma.post.findMany({
      where: {
        businessId: finalBusinessId,
        postedAt: { gte: startDate }
      },
      take: 5,
      orderBy: { likes: 'desc' } // Better sort for insights
    });

    // Generate AI insights based on data
    const insights = generateInsights({
      totalPosts,
      totalLikes: totalAnalytics._sum.likes || 0,
      totalShares: totalAnalytics._sum.shares || 0,
      totalComments: totalAnalytics._sum.comments || 0,
      totalImpressions: totalAnalytics._sum.impressions || 0,
      engagementRate: parseFloat(engagementRate),
      topPosts: topPosts.map(post => ({
        id: post.id,
        platform: post.platform,
        postedAt: post.postedAt,
        analytics: {
          likes: post.likes,
          shares: post.shares,
          comments: post.comments,
          impressions: post.impressions,
          clicks: post.clicks,
        }
      }))
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalPosts,
          totalLikes: totalAnalytics._sum.likes || 0,
          totalShares: totalAnalytics._sum.shares || 0,
          totalComments: totalAnalytics._sum.comments || 0,
          totalImpressions: totalAnalytics._sum.impressions || 0,
          totalClicks: totalAnalytics._sum.clicks || 0,
          engagementRate: `${engagementRate}%`,
          period: `${days} days`
        },
        insights,
        recommendations: generateRecommendations(insights)
      }
    });
  } catch (error) {
    console.error('Failed to get insights:', error);
    return NextResponse.json(
      { error: 'Failed to get insights' },
      { status: 500 }
    );
  }
}

function generateInsights(data: {
  totalPosts: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalImpressions: number;
  engagementRate: number;
  topPosts: Array<{
    id: string;
    platform: string;
    postedAt: Date | null;
    analytics: {
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
      clicks: number;
    } | null;
  }>;
}) {
  const insights = [];

  // Performance insights
  if (data.engagementRate > 5) {
    insights.push({
      type: 'performance',
      title: 'Excellent Engagement',
      description: `Your engagement rate of ${data.engagementRate.toFixed(2)}% is above industry average.`,
      priority: 'high'
    });
  } else if (data.engagementRate < 2) {
    insights.push({
      type: 'performance',
      title: 'Low Engagement',
      description: `Your engagement rate of ${data.engagementRate.toFixed(2)}% needs improvement.`,
      priority: 'medium'
    });
  }

  // Posting frequency insights
  const avgPostsPerDay = data.totalPosts / 30;
  if (avgPostsPerDay < 1) {
    insights.push({
      type: 'frequency',
      title: 'Increase Posting Frequency',
      description: `You're posting ${avgPostsPerDay.toFixed(1)} times per day. Consider posting more regularly.`,
      priority: 'medium'
    });
  } else if (avgPostsPerDay > 3) {
    insights.push({
      type: 'frequency',
      title: 'Optimal Posting Frequency',
      description: `You're posting ${avgPostsPerDay.toFixed(1)} times per day, which is a good frequency.`,
      priority: 'low'
    });
  }

  // Content performance insights
  const avgLikesPerPost = data.totalPosts > 0 ? data.totalLikes / data.totalPosts : 0;
  if (avgLikesPerPost > 100) {
    insights.push({
      type: 'content',
      title: 'Strong Content Performance',
      description: `Your posts average ${avgLikesPerPost.toFixed(0)} likes each.`,
      priority: 'high'
    });
  }

  return insights;
}

function generateRecommendations(insights: Array<{
  type: string;
  title: string;
  description: string;
  priority: string;
}>) {
  const recommendations: Array<{
    title: string;
    description: string;
    action: string;
  }> = [];

  insights.forEach(insight => {
    switch (insight.type) {
      case 'performance':
        if (insight.priority === 'medium') {
          recommendations.push({
            title: 'Improve Content Quality',
            description: 'Focus on creating more engaging content with better visuals and compelling captions.',
            action: 'content'
          });
        }
        break;
      case 'frequency':
        if (insight.priority === 'medium') {
          recommendations.push({
            title: 'Create Content Calendar',
            description: 'Plan and schedule posts in advance to maintain consistent posting frequency.',
            action: 'scheduling'
          });
        }
        break;
      case 'content':
        recommendations.push({
          title: 'Analyze Top Performing Posts',
          description: 'Study your most successful posts and replicate their style and topics.',
          action: 'analysis'
        });
        break;
    }
  });

  return recommendations;
}
