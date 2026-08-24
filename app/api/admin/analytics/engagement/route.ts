import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { subDays, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30");
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const agg = await prisma.post.aggregate({
        _sum: { impressions: true, clicks: true, likes: true, comments: true, shares: true },
        where: { postedAt: { gte: dayStart, lt: dayEnd } },
      });
      data.push({
        date: format(day, "MMM dd"),
        impressions: agg._sum.impressions ?? 0,
        clicks: agg._sum.clicks ?? 0,
        likes: agg._sum.likes ?? 0,
        comments: agg._sum.comments ?? 0,
        shares: agg._sum.shares ?? 0,
      });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching engagement data:", error);
    return NextResponse.json({ error: "Failed to fetch engagement data" }, { status: 500 });
  }
}
