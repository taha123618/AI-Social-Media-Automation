import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const range = req.nextUrl.searchParams.get("range") ?? "7d";
  const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [
      totalArticles,
      totalUsers,
      totalGenerations,
      articlesWithScores,
      dailyLogs,
      topKeywords,
    ] = await Promise.all([
      prisma.blogArticle.count(),
      prisma.blogArticle.groupBy({ by: ["creatorId"] }).then((r) => r.length),
      prisma.blogGenerationLog.count({ where: { createdAt: { gte: since } } }),
      prisma.blogArticle.findMany({
        where: { seoScore: { not: null } },
        select: { seoScore: true, readabilityScore: true, wordCount: true, id: true, content: true, title: true },
      }),
      prisma.blogGenerationLog.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.blogArticle.findMany({
        select: { targetKeywords: true },
      }),
    ]);

    const avgSeoScore = articlesWithScores.length > 0
      ? Math.round(articlesWithScores.reduce((sum, a) => sum + (a.seoScore ?? 0), 0) / articlesWithScores.length)
      : 0;

    const avgReadabilityScore = articlesWithScores.length > 0
      ? Math.round(articlesWithScores.reduce((sum, a) => sum + ((a.readabilityScore ?? 0) * 100), 0) / articlesWithScores.length)
      : 0;

    const totalWordsWritten = articlesWithScores.reduce((sum, a) => sum + a.wordCount, 0);
    const avgWordsPerArticle = articlesWithScores.length > 0 ? Math.round(totalWordsWritten / articlesWithScores.length) : 0;

    // Daily stats
    const dailyMap = new Map<string, number>();
    for (const log of dailyLogs) {
      const date = log.createdAt.toISOString().split("T")[0];
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    }
    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top keywords
    const keywordMap = new Map<string, number>();
    for (const article of topKeywords) {
      for (const kw of article.targetKeywords) {
        keywordMap.set(kw, (keywordMap.get(kw) ?? 0) + 1);
      }
    }
    const topKeywordsSorted = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Trends
    const previousPeriod = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
    const previousCount = await prisma.blogGenerationLog.count({
      where: { createdAt: { gte: previousPeriod, lt: since } },
    });
    const generationTrend = previousCount > 0
      ? Math.round(((totalGenerations - previousCount) / previousCount) * 100)
      : 100;

    const previousUsers = await prisma.blogArticle.groupBy({
      by: ["creatorId"],
      where: { createdAt: { gte: previousPeriod, lt: since } },
    }).then((r) => r.length);
    const userTrend = previousUsers > 0
      ? Math.round(((totalUsers - previousUsers) / previousUsers) * 100)
      : 100;

    return NextResponse.json({
      totalArticles,
      totalUsers,
      totalGenerations,
      avgSeoScore,
      avgReadabilityScore,
      totalWordsWritten,
      avgWordsPerArticle,
      generationTrend,
      userTrend,
      topKeywords: topKeywordsSorted,
      dailyStats,
    });
  } catch (error) {
    console.error("[ADMIN-BLOG-ANALYTICS] Error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
