import { NextResponse } from 'next/server';
import { calculateConsistencyScore } from '@/features/analytics/services/consistency-scorer.service';
import prisma from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache';
import redis from '@/lib/redis';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import { GrowthAnalyticsService } from '@/features/analytics/services/growth-analytics.service';
import { AdBoosterService } from '@/features/social/services/ad-booster.service';

const CACHE_KEY_PREFIX = 'dashboard:';
const CACHE_TTL_SECONDS = 30; // short TTL to keep dashboard near-real-time

interface DashboardData {
  metrics: Array<{ label: string; value: string; change: string }>;
  drafts: Array<{ id: string; title: string; status: string; date: string; platforms: string[]; author: string | null }>;
  workflows: Array<{ draftId: string; title: string; business: string | null; requestedBy: string | null; createdAt: string | undefined; status: string }>;
  accounts: Array<{ id: string; name: string; platform: string; avatar: string | null; active: boolean }>;
  workflowStats: {
    total: number;
    active: number;
    recentExecutions: number;
    successRate: string;
  };
  brandHealth: {
    score: number;
    engagement: number;
    consistency: number;
    reach: number;
  };
  recentAutomations: Array<{
    id: string;
    workflowName: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
  }>;
  growth: {
    postsPublished: number;
    totalEngagement: number;
    leadsCaptured: number;
    consistencyScore: number;
    estimatedRevenueImpact: string;
    summary: string;
  } | null;
  adRecommendations: Array<{
    postId: string;
    title: string;
    engagementRate: string;
    status: string;
    suggestedBudget: string;
    reason: string;
  }>;
}

/**
 * Extract businessId from request (query param or header)
 * Used to scope dashboard metrics and content to a single business
 */
function extractBusinessId(request: Request): string | undefined {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('businessId');
  const fromHeader = request.headers.get('x-business-id');
  return fromQuery || fromHeader || undefined;
}

/**
 * Fetch cached data from Redis if available, fallback to in-memory cache
 */
async function getCachedData(key: string): Promise<DashboardData | null> {
  // Try Redis first
  try {
    if (redis) {
      const raw = await redis.get(key);
      if (raw) {
        return JSON.parse(raw) as DashboardData;
      }
    }
  } catch (rErr) {
    console.warn('Redis read failed, falling back to in-memory cache', rErr);
  }

  // Fallback to in-memory cache
  return getCache<DashboardData>(key);
}

/**
 * Set cache in both Redis and in-memory stores
 */
async function setCachedData(key: string, data: DashboardData): Promise<void> {
  // Set in-memory cache
  setCache(key, data, CACHE_TTL_SECONDS);

  // Attempt Redis cache (non-blocking failure)
  try {
    if (redis) {
      await redis.set(key, JSON.stringify(data), { EX: CACHE_TTL_SECONDS });
    }
  } catch (rErr) {
    console.warn('Failed to write dashboard cache to Redis', rErr);
  }
}

export async function GET(request: Request) {
  try {
    const defaultId = await getActiveWorkspaceIdSafe().catch(() => undefined);
    const businessId = extractBusinessId(request) || defaultId;
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';

    const cacheKey = businessId ? `${CACHE_KEY_PREFIX}${businessId}` : `${CACHE_KEY_PREFIX}global`;

    // Only use cache if no search is active
    if (!search) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Build where clause for scoped queries
    const businessFilter = businessId ? { businessId } : undefined;

    // Add search filter if present
    const searchFilter: any = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { customPrompt: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    // Optimized parallel Prisma queries scoped by business
    const [
      draftCount,
      postCount,
      analyticsData,
      recentDrafts,
      activeAccounts,
      pendingWorkflows,
      workflowCounts,
      activeWorkflowCount,
      recentExecutions,
      executionStats,
      consistencyData,
      growthResult,
      adRecommendationsResult
    ] =
      await Promise.all([
        prisma.contentDraft.count({ where: businessFilter }),
        prisma.post.count({ where: businessFilter }),
        // Fetch recent post metrics directly from Post table
        prisma.post.findMany({
          where: businessFilter,
          take: 100,
          select: { impressions: true, likes: true, shares: true, comments: true },
        }),
        prisma.contentDraft.findMany({
          where: { ...businessFilter, ...searchFilter },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { creator: { select: { name: true } } },
        }),
        prisma.socialAccount.findMany({
          where: { ...(businessFilter || {}), isActive: true },
          take: 10,
          orderBy: { name: 'asc' },
          select: { id: true, name: true, platform: true, avatar: true, isActive: true },
        }),
        prisma.contentDraft.findMany({
          where: {
            ...(businessFilter || {}),
            status: 'PENDING_REVIEW',
            ...searchFilter
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { business: { select: { name: true } }, creator: { select: { name: true } } },
        }),
        // Workflow counts
        prisma.workflow.count({ where: businessFilter }),
        prisma.workflow.count({ where: { ...businessFilter, isActive: true } }),
        // Recent executions
        prisma.workflowExecution.findMany({
          where: businessFilter ? { workflow: { businessId: businessFilter.businessId } } : undefined,
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { workflow: { select: { name: true } } }
        }),
        // Execution success rate (last 100)
        prisma.workflowExecution.groupBy({
          by: ['status'],
          where: businessFilter ? { workflow: { businessId: businessFilter.businessId } } : undefined,
          _count: { id: true },
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 100
        }),
        // Consistency Score
        businessId ? calculateConsistencyScore(businessId, 30) : Promise.resolve({ overall: 70 }),
        // Growth Data
        businessId ? GrowthAnalyticsService.getGrowthDashboard(businessId) : Promise.resolve({ success: false }),
        // Ad Recommendations
        businessId ? AdBoosterService.getAdRecommendations(businessId) : Promise.resolve({ success: false })
      ]);

    // Aggregate analytics data in memory
    const analyticsSum = analyticsData.reduce(
      (acc: any, a: any) => ({
        impressions: (acc.impressions || 0) + (a.impressions || 0),
        likes: (acc.likes || 0) + (a.likes || 0),
        shares: (acc.shares || 0) + (a.shares || 0),
        comments: (acc.comments || 0) + (a.comments || 0),
      }),
      { impressions: 0, likes: 0, shares: 0, comments: 0 }
    );

    const totalReach = analyticsSum.impressions ?? 0;
    const totalEngagements = (analyticsSum.likes ?? 0) + (analyticsSum.shares ?? 0) + (analyticsSum.comments ?? 0);
    const engagementRate = totalReach ? ((totalEngagements / totalReach) * 100).toFixed(1) + '%' : '0%';

    // Calculate success rate from executionStats
    const statsArray = executionStats as any[];
    const totalExecs = statsArray.reduce((acc, s) => acc + s._count.id, 0);
    const completedExecs = statsArray.find(s => s.status === 'COMPLETED')?._count.id || 0;
    const successRate = totalExecs > 0 ? ((completedExecs / totalExecs) * 100).toFixed(1) + '%' : '100%';

    // Brand Health Logic
    const consistencyScore = (consistencyData as any)?.overall || 70;

    // Calculate Engagement Score (0-100)
    // 5% engagement rate is considered 100% health for this metric
    const engagementScore = Math.min(100, Math.round(parseFloat(engagementRate) * 20));

    // Calculate Reach Score (0-100)
    // 1000 impressions per month as a baseline for 100% (adjustable)
    const reachScore = Math.min(100, Math.round((totalReach / 1000) * 100));

    const brandHealthScore = Math.round(
      (engagementScore * 0.4) + (consistencyScore * 0.4) + (reachScore * 0.2)
    );

    const data: DashboardData = {
      metrics: [
        { label: 'Content Drafts', value: String(draftCount), change: '' },
        { label: 'Published Posts', value: String(postCount), change: '' },
        { label: 'Active Automations', value: String(activeWorkflowCount), change: '' },
        { label: 'Engagement Rate', value: engagementRate, change: '' },
      ],
      brandHealth: {
        score: brandHealthScore || 70,
        engagement: engagementScore || 0,
        consistency: consistencyScore || 0,
        reach: reachScore || 0
      },
      drafts: recentDrafts.map((d: any) => ({
        id: d.id,
        title: d.title ?? 'Untitled',
        status: (d.status ?? 'GENERATED').toLowerCase(),
        date: d.scheduledFor ? d.scheduledFor?.toISOString?.() : d.createdAt.toISOString(),
        platforms: d.platforms ?? [],
        author: d.creator?.name ?? null,
      })),
      workflows: pendingWorkflows.map((pw: any) => ({
        draftId: pw.id,
        title: pw.title ?? 'Untitled',
        business: pw.business?.name ?? null,
        requestedBy: pw.creator?.name ?? null,
        createdAt: pw.createdAt?.toISOString?.(),
        status: 'PENDING_REVIEW',
      })),
      accounts: activeAccounts.map((a: any) => ({
        id: a.id,
        name: a.name ?? a.platform,
        platform: a.platform,
        avatar: a.avatar ?? null,
        active: a.isActive,
      })),
      workflowStats: {
        total: workflowCounts,
        active: activeWorkflowCount,
        recentExecutions: recentExecutions.length,
        successRate
      },
      recentAutomations: recentExecutions.map(re => ({
        id: re.id,
        workflowName: re.workflow.name,
        status: re.status,
        startedAt: re.startedAt?.toISOString() || null,
        completedAt: re.completedAt?.toISOString() || null,
      })),
      growth: (growthResult as any).success ? {
        ...(growthResult as any).metrics,
        summary: (growthResult as any).summary
      } : null,
      adRecommendations: (adRecommendationsResult as any).success ? (adRecommendationsResult as any).recommendations : []
    };

    // Cache the assembled payload
    await setCachedData(cacheKey, data);

    return NextResponse.json(data);
  } catch (err) {
    console.error('Dashboard API error:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
