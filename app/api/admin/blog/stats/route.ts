import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { subDays, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const [totalArticles, publishedArticles, draftArticles, totalUsers, avgSeoScore, articlesLast7] = await Promise.all([
      prisma.blogArticle.count(),
      prisma.blogArticle.count({ where: { status: "PUBLISHED" } }),
      prisma.blogArticle.count({ where: { status: "DRAFT" } }),
      prisma.user.count(),
      prisma.blogArticle.aggregate({ _avg: { seoScore: true } }),
      prisma.blogArticle.findMany({
        where: { createdAt: { gte: subDays(now, 7) } },
        select: { createdAt: true, wordCount: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const avgSeo = avgSeoScore._avg.seoScore ?? 0;
    const blogUsageData = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const dayArticles = articlesLast7.filter(
        a => format(new Date(a.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      );
      return {
        name: format(day, "EEE"),
        articles: dayArticles.length,
        tokens: dayArticles.reduce((sum, a) => sum + (a.wordCount ?? 0) * 4, 0),
      };
    });

    const topTemplates = await prisma.blogTemplate.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      totalArticles: totalArticles.toString(),
      publishedArticles: publishedArticles.toString(),
      draftArticles: draftArticles.toString(),
      tokensConsumed: (totalArticles * 1200).toLocaleString(),
      activeUsers: totalUsers.toString(),
      avgSeoScore: `${Math.round(avgSeo)}/100`,
      seoScoreValue: Math.round(avgSeo),
      usageData: blogUsageData,
      topTemplates: topTemplates.map(t => ({
        name: t.name,
        count: 0,
        category: t.category ?? "General",
      })),
      seoChange: "+2%",
      articlesChange: "+12%",
      tokensChange: "+5%",
      usersChange: "+18%",
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    return NextResponse.json({ error: "Failed to fetch blog stats" }, { status: 500 });
  }
}
