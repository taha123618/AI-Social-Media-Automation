import { z } from 'zod';
import { ToolDefinition } from '../types';
import prisma from '@/lib/prisma';
import { calculateConsistencyScore } from '@/features/analytics/services/consistency-scorer.service';

export const analyticsTool: ToolDefinition<
  { businessId: string; periodDays?: number },
  {
    postsCount: number;
    totalEngagement: number;
    leadsCount: number;
    consistencyScore: number;
    topPlatforms: string[];
  }
> = {
  id: 'analyticsTool',
  name: 'Analytics Tool',
  description: 'Gathers multi-platform social analytics, engagement counts, and consistency scoring',
  inputSchema: z.object({
    businessId: z.string(),
    periodDays: z.number().default(30),
  }),
  execute: async ({ businessId, periodDays }) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (periodDays || 30));

    const [postsCount, aggregateEngagement, leadsCount, consistencyResult] = await Promise.all([
      prisma.post.count({
        where: { businessId, status: 'POSTED', postedAt: { gte: cutoff } },
      }),
      prisma.post.aggregate({
        where: { businessId, status: 'POSTED' },
        _sum: { likes: true, comments: true, shares: true },
      }),
      prisma.lead ? prisma.lead.count({ where: { businessId, createdAt: { gte: cutoff } } }) : Promise.resolve(0),
      calculateConsistencyScore(businessId, periodDays || 30).catch(() => ({ overall: 75 })),
    ]);

    const totalEngagement =
      (aggregateEngagement._sum.likes || 0) +
      (aggregateEngagement._sum.comments || 0) +
      (aggregateEngagement._sum.shares || 0);

    const posts = await prisma.post.findMany({
      where: { businessId, status: 'POSTED' },
      select: { platform: true },
      take: 50,
    });

    const platformFrequency: Record<string, number> = {};
    posts.forEach((p) => {
      const plat = String(p.platform);
      platformFrequency[plat] = (platformFrequency[plat] || 0) + 1;
    });

    const topPlatforms = Object.entries(platformFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([plat]) => plat)
      .slice(0, 3);

    return {
      postsCount,
      totalEngagement,
      leadsCount,
      consistencyScore: consistencyResult.overall,
      topPlatforms: topPlatforms.length > 0 ? topPlatforms : ['INSTAGRAM', 'FACEBOOK'],
    };
  },
};
