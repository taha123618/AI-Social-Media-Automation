import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.blogArticle.findMany({
    select: {
      creatorId: true,
      creator: { select: { id: true, name: true, email: true } },
      seoScore: true,
      wordCount: true,
      updatedAt: true,
    },
  });

  const userMap = new Map<string, {
    id: string;
    name: string | null;
    email: string;
    totalArticles: number;
    totalWords: number;
    seoScores: number[];
    lastActivity: Date;
  }>();

  for (const article of articles) {
    const existing = userMap.get(article.creatorId);
    if (existing) {
      existing.totalArticles += 1;
      existing.totalWords += article.wordCount;
      if (article.seoScore !== null) existing.seoScores.push(article.seoScore);
      if (article.updatedAt > existing.lastActivity) existing.lastActivity = article.updatedAt;
    } else {
      userMap.set(article.creatorId, {
        id: article.creator.id,
        name: article.creator.name,
        email: article.creator.email,
        totalArticles: 1,
        totalWords: article.wordCount,
        seoScores: article.seoScore !== null ? [article.seoScore] : [],
        lastActivity: article.updatedAt,
      });
    }
  }

  const users = Array.from(userMap.values())
    .map((u) => ({
      ...u,
      avgSeoScore: u.seoScores.length > 0
        ? Math.round(u.seoScores.reduce((a, b) => a + b, 0) / u.seoScores.length)
        : 0,
      status: "active" as const,
    }))
    .sort((a, b) => b.totalArticles - a.totalArticles);

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId, status } = await req.json();
    // In production, update user status in the database
    return NextResponse.json({ success: true, userId, status });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
