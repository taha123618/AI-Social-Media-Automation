import prisma from "@/lib/prisma";
import DashboardClient from "./_components/dashboard-client";
import { Users, ShieldCheck, Activity, Calendar } from "lucide-react";
import { subDays } from "date-fns";

// Force dynamic rendering to prevent prerendering issues with database queries
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  const [
    totalAdmins,
    totalUsers,
    totalPosts,
    totalBusinesses,
    usersLast30,
    usersPrevious30,
    postsLast30,
    postsPrevious30,
    securityEvents
  ] = await Promise.all([
    prisma.admin.count(),
    prisma.user.count(),
    prisma.post.count(),
    prisma.business.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.post.count({ where: { postedAt: { gte: thirtyDaysAgo } } }),
    prisma.post.count({ where: { postedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.jobLog.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    })
  ]);

  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return "+100%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const stats = [
    {
      title: "Active Admins",
      value: totalAdmins,
      icon: "shield" as const,
      description: "Administrators in the system",
      trend: "up" as const,
      trendValue: calcTrend(totalAdmins, Math.max(totalAdmins - 1, 1)),
    },
    {
      title: "Total Registered Users",
      value: totalUsers,
      icon: "users" as const,
      description: "Platform members",
      trend: usersLast30 >= usersPrevious30 ? ("up" as const) : ("down" as const),
      trendValue: calcTrend(usersLast30, usersPrevious30 || 1),
    },
    {
      title: "Content Cycles",
      value: totalPosts,
      icon: "calendar" as const,
      description: "AI Generated/Scheduled",
      trend: postsLast30 >= postsPrevious30 ? ("up" as const) : ("down" as const),
      trendValue: calcTrend(postsLast30, postsPrevious30 || 1),
    },
    {
      title: "Business Profiles",
      value: totalBusinesses,
      icon: "activity" as const,
      description: "Active business connections",
      trend: "up" as const,
      trendValue: "+0%",
    },
  ];

  const formattedEvents = securityEvents.map(log => ({
    id: log.id,
    user: log.queueName === "email" ? "Email Service" : "System Worker",
    action: `${log.status.toUpperCase()}: ${log.queueName} job processed`,
    time: log.createdAt.toISOString(),
    type: (log.status === "failed" ? "warning" : log.status === "completed" ? "success" : "info") as "warning" | "success" | "info",
  }));

  return <DashboardClient statsData={stats} securityEvents={formattedEvents} />;
}
