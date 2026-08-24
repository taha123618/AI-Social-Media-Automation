import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [impressionsAgg, clicksAgg, sharesAgg, likesAgg, commentsAgg] = await Promise.all([
      prisma.post.aggregate({ _sum: { impressions: true } }),
      prisma.post.aggregate({ _sum: { clicks: true } }),
      prisma.post.aggregate({ _sum: { shares: true } }),
      prisma.post.aggregate({ _sum: { likes: true } }),
      prisma.post.aggregate({ _sum: { comments: true } }),
    ]);
    const totalImpressions = impressionsAgg._sum.impressions ?? 0;
    const totalClicks = clicksAgg._sum.clicks ?? 0;
    const totalShares = sharesAgg._sum.shares ?? 0;
    const totalLikes = likesAgg._sum.likes ?? 0;
    const totalComments = commentsAgg._sum.comments ?? 0;
    const totalEngagement = totalLikes + totalComments + totalShares;
    const clickRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) + "%" : "0%";

    return NextResponse.json({
      views: totalImpressions.toLocaleString(),
      clicks: clickRate,
      shares: totalShares.toLocaleString(),
      likes: totalLikes.toLocaleString(),
      comments: totalComments.toLocaleString(),
      engagement: totalEngagement.toLocaleString(),
    });
  } catch (error) {
    console.error("Error fetching analytics totals:", error);
    return NextResponse.json({ error: "Failed to fetch analytics totals" }, { status: 500 });
  }
}
