/**
 * Blog Analytics Service
 * Provides analytics and insights for blog content performance
 */

import prisma from "@/lib/prisma";

interface AnalyticsQuery {
  businessId: string;
  startDate?: Date;
  endDate?: Date;
}

export class BlogAnalyticsService {
  /**
   * Get dashboard analytics for a business
   */
  static async getDashboardAnalytics(query: AnalyticsQuery) {
    const { businessId, startDate, endDate } = query;
    const where = {
      businessId,
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
      ...(endDate ? { createdAt: { lte: endDate } } : {}),
    };

    const [totalArticles, statusBreakdown, avgSeoScore, recentArticles, generationLogs] =
      await Promise.all([
        prisma.blogArticle.count({ where }),
        prisma.blogArticle.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),
        prisma.blogArticle.aggregate({
          where: { ...where, seoScore: { not: null } },
          _avg: { seoScore: true },
        }),
        prisma.blogArticle.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            wordCount: true,
            readingTime: true,
            seoScore: true,
            updatedAt: true,
          },
        }),
        prisma.blogGenerationLog.groupBy({
          by: ["action"],
          where,
          _count: true,
        }),
      ]);

    const totalWords = recentArticles.reduce((sum, a) => sum + a.wordCount, 0);

    return {
      totalArticles,
      statusBreakdown: statusBreakdown.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count }),
        {} as Record<string, number>,
      ),
      avgSeoScore: Math.round(avgSeoScore._avg.seoScore ?? 0),
      totalWords,
      recentArticles,
      generationLogs: generationLogs.reduce(
        (acc, l) => ({ ...acc, [l.action]: l._count }),
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Get SEO performance metrics
   */
  static async getSEOMetrics(businessId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const reports = await prisma.blogSEOReport.findMany({
      where: {
        article: { businessId },
        analyzedAt: { gte: since },
      },
      orderBy: { analyzedAt: "desc" },
      take: 100,
    });

    if (reports.length === 0) {
      return {
        averageScore: 0,
        scoresOverTime: [],
        improvementRate: 0,
      };
    }

    const averageScore = Math.round(
      reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length,
    );

    const scoresOverTime = reports
      .slice()
      .reverse()
      .map((r) => ({
        date: r.analyzedAt.toISOString().split("T")[0],
        score: r.overallScore,
      }));

    // Calculate improvement rate
    const midPoint = Math.floor(reports.length / 2);
    const firstHalf = reports.slice(0, midPoint);
    const secondHalf = reports.slice(midPoint);
    const firstAvg = firstHalf.reduce((s, r) => s + r.overallScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, r) => s + r.overallScore, 0) / secondHalf.length;
    const improvementRate = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;

    return { averageScore, scoresOverTime, improvementRate };
  }

  /**
   * Get keyword performance analytics
   */
  static async getKeywordAnalytics(businessId: string) {
    const articles = await prisma.blogArticle.findMany({
      where: { businessId },
      select: { targetKeywords: true, secondaryKeywords: true, seoScore: true },
    });

    const keywordScores = new Map<string, number[]>();

    for (const article of articles) {
      const allKeywords = [...article.targetKeywords, ...article.secondaryKeywords];
      for (const kw of allKeywords) {
        const existing = keywordScores.get(kw) ?? [];
        if (article.seoScore !== null) existing.push(article.seoScore);
        keywordScores.set(kw, existing);
      }
    }

    const keywordPerformance = Array.from(keywordScores.entries())
      .map(([keyword, scores]) => ({
        keyword,
        usageCount: scores.length,
        avgScore: scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 50);

    return { keywordPerformance };
  }

  /**
   * Get content generation trends
   */
  static async getGenerationTrends(businessId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await prisma.blogGenerationLog.findMany({
      where: {
        businessId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
    });

    const dailyCount = new Map<string, number>();
    for (const log of logs) {
      const date = log.createdAt.toISOString().split("T")[0];
      dailyCount.set(date, (dailyCount.get(date) ?? 0) + 1);
    }

    return {
      trends: Array.from(dailyCount.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      total: logs.length,
      dailyAverage: logs.length > 0 ? Math.round(logs.length / days) : 0,
    };
  }
}
