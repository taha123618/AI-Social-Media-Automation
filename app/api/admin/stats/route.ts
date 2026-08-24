import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const [
      totalUsers, totalPosts, totalBusinesses, totalAdmins,
      totalBlogArticles, totalWorkflows, totalSocialAccounts,
      usersLast30, postsLast30,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.business.count(),
      prisma.admin.count(),
      prisma.blogArticle.count(),
      prisma.workflow.count(),
      prisma.socialAccount.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.post.count({ where: { postedAt: { gte: thirtyDaysAgo } } }),
    ]);

    return NextResponse.json({
      totalUsers, totalPosts, totalBusinesses, totalAdmins,
      totalBlogArticles, totalWorkflows, totalSocialAccounts,
      usersLast30, postsLast30,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
