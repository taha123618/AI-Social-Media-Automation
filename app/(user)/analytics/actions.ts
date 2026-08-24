'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';

export async function getAnalyticsData(days: number = 30) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return null;

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get posts for the period (no need to include analytics as it's now flattened)
  const posts = await prisma.post.findMany({
    where: {
      businessId,
      postedAt: { gte: startDate }
    },
    include: {
      draft: {
        select: { contentJson: true, title: true }
      }
    }
  });

  // Aggregate stats directly from Post
  const aggregate = posts.reduce((acc, post) => {
    acc.likes += post.likes;
    acc.shares += post.shares;
    acc.comments += post.comments;
    acc.impressions += post.impressions;
    acc.clicks += post.clicks;
    acc.reach += post.reach;
    acc.saves += post.saves;
    acc.videoViews += post.videoViews;
    return acc;
  }, { likes: 0, shares: 0, comments: 0, impressions: 0, clicks: 0, reach: 0, saves: 0, videoViews: 0 });

  return {
    posts: posts.map(p => ({
      id: p.id,
      platform: p.platform,
      postedAt: p.postedAt,
      status: p.status,
      title: p.draft?.title || (p.draft?.contentJson as { title?: string })?.title || 'Untitled',
      metrics: {
        likes: p.likes,
        shares: p.shares,
        comments: p.comments,
        impressions: p.impressions,
        clicks: p.clicks,
        reach: p.reach,
        saves: p.saves,
        videoViews: p.videoViews,
        profileVisits: p.profileVisits,
        websiteClicks: p.websiteClicks,
        bookingClicks: p.bookingClicks,
        phoneClicks: p.phoneClicks,
        messageClicks: p.messageClicks,
        directionRequests: p.directionRequests,
      }
    })),
    aggregate
  };
}

export async function getBusinessInsights() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalPosts, totalEngagement] = await Promise.all([
    prisma.post.count({
      where: {
        businessId,
        status: 'POSTED',
        postedAt: { gte: thirtyDaysAgo }
      }
    }),

    prisma.post.aggregate({
      where: {
        businessId,
        status: 'POSTED',
        postedAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        likes: true,
        shares: true,
        comments: true,
        impressions: true,
        clicks: true,
        reach: true,
        saves: true,
      }
    }),
  ]);

  return {
    totalPosts,
    totalEngagement: {
      likes: totalEngagement._sum.likes || 0,
      shares: totalEngagement._sum.shares || 0,
      comments: totalEngagement._sum.comments || 0,
      impressions: totalEngagement._sum.impressions || 0,
      clicks: totalEngagement._sum.clicks || 0,
      reach: totalEngagement._sum.reach || 0,
      saves: totalEngagement._sum.saves || 0,
    }
  };
}

export async function triggerAnalyticsCollection(postId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new Error('No business selected');

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, platform: true, businessId: true, externalPostId: true }
  });

  if (!post || post.businessId !== businessId) {
    throw new Error('Post not found or access denied');
  }

  // Upsert PostAnalytics record with mock data (replace with real API in production)
  const mockMetrics = {
    likes: Math.floor(Math.random() * 500) + 10,
    shares: Math.floor(Math.random() * 100) + 5,
    comments: Math.floor(Math.random() * 80) + 2,
    impressions: Math.floor(Math.random() * 2000) + 100,
    clicks: Math.floor(Math.random() * 150) + 10,
    reach: Math.floor(Math.random() * 1800) + 90,
    saves: Math.floor(Math.random() * 60) + 1,
    videoViews: Math.floor(Math.random() * 400) + 20,
    profileVisits: Math.floor(Math.random() * 50) + 1,
    websiteClicks: Math.floor(Math.random() * 30) + 1,
    bookingClicks: Math.floor(Math.random() * 10),
    phoneClicks: Math.floor(Math.random() * 15),
    messageClicks: Math.floor(Math.random() * 20),
    directionRequests: Math.floor(Math.random() * 8),
  };

  await prisma.post.update({
    where: { id: post.id },
    data: {
      ...mockMetrics,
      analyticsUpdatedAt: new Date()
    }
  });

  return { success: true, message: 'Analytics updated successfully' };
}

export async function scheduleWeeklyCollection() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return null;

  // Find posts from last 7 days and update their analytics
  const posts = await prisma.post.findMany({
    where: {
      businessId,
      status: 'POSTED',
      postedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    select: { id: true }
  });

  let updated = 0;
  for (const post of posts) {
    try {
      await triggerAnalyticsCollection(post.id);
      updated++;
    } catch {
      // Continue on individual failures
    }
  }

  return { success: true, message: `Updated analytics for ${updated} posts` };
}

export async function getPerformanceMetrics(days: number = 30) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return null;

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get daily performance data directly from Post table (no join needed)
  const dailyStats = await prisma.$queryRaw`
    SELECT
      DATE(p."postedAt") as date,
      COUNT(*) as "postsCount",
      COALESCE(SUM(p.likes), 0) as "totalLikes",
      COALESCE(SUM(p.shares), 0) as "totalShares",
      COALESCE(SUM(p.comments), 0) as "totalComments",
      COALESCE(SUM(p.impressions), 0) as "totalImpressions",
      COALESCE(SUM(p.clicks), 0) as "totalClicks",
      COALESCE(SUM(p.reach), 0) as "totalReach",
      COALESCE(SUM(p.saves), 0) as "totalSaves"
    FROM "Post" p
    WHERE p."businessId" = ${businessId}
      AND p."postedAt" >= ${startDate}
    GROUP BY DATE(p."postedAt")
    ORDER BY date DESC
    LIMIT 30
  `;

  // Get platform breakdown
  const postsWithAnalytics = await prisma.post.findMany({
    where: {
      businessId,
      postedAt: { gte: startDate }
    },
    include: {
      workflow: { select: { name: true } }
    }
  });

  const platformStats = postsWithAnalytics.reduce((acc, post) => {
    const platform = post.platform;
    if (!acc[platform]) {
      acc[platform] = { posts: 0, likes: 0, shares: 0, comments: 0, impressions: 0, clicks: 0, reach: 0, saves: 0 };
    }
    acc[platform].posts += 1;
    acc[platform].likes += post.likes;
    acc[platform].shares += post.shares;
    acc[platform].comments += post.comments;
    acc[platform].impressions += post.impressions;
    acc[platform].clicks += post.clicks;
    acc[platform].reach += post.reach;
    acc[platform].saves += post.saves;
    return acc;
  }, {} as Record<string, { posts: number; likes: number; shares: number; comments: number; impressions: number; clicks: number; reach: number; saves: number }>);

  // Get top performing posts from PostAnalytics
  const topContent = await prisma.post.findMany({
    where: {
      businessId,
      postedAt: { gte: startDate }
    },
    include: {
      draft: { select: { contentJson: true, title: true } }
    },
    orderBy: { postedAt: 'desc' },
    take: 10
  });

  return {
    dailyStats,
    platformStats,
    topContent: topContent
      .map(post => ({
        id: post.id,
        title: post.draft?.title || (post.draft?.contentJson as { title?: string })?.title || 'Untitled',
        platform: post.platform,
        postedAt: post.postedAt,
        metrics: {
          likes: post.likes,
          shares: post.shares,
          comments: post.comments,
          impressions: post.impressions,
          clicks: post.clicks,
          reach: post.reach,
          saves: post.saves,
        }
      }))
      .sort((a, b) => b.metrics.likes - a.metrics.likes)
  };
}
