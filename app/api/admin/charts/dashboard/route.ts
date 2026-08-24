import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { subDays, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const [posts, users, engagements] = await Promise.all([
        prisma.post.count({ where: { postedAt: { gte: dayStart, lt: dayEnd } } }),
        prisma.user.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
        prisma.post.aggregate({
          _sum: { likes: true, comments: true, shares: true },
          where: { postedAt: { gte: dayStart, lt: dayEnd } },
        }),
      ]);
      const totalEngagement = (engagements._sum.likes ?? 0) + (engagements._sum.comments ?? 0) + (engagements._sum.shares ?? 0);
      data.push({
        name: format(day, "EEE"),
        users,
        posts,
        engagement: totalEngagement,
      });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard chart data:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
