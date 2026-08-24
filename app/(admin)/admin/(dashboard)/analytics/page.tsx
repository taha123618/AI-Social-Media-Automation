import React from "react";
import prisma from "@/lib/prisma";
import AnalyticsClient from "./_components/analytics-client";
import { startOfMonth, subMonths, format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const [
    totalUsers,
    totalPosts,
    socialPostsByPlatform,
    monthlyUsersRaw,
    impressionsAgg,
    clicksAgg,
    sharesAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.socialAccount.groupBy({
      by: ['platform'],
      _count: true,
    }),
    prisma.user.findMany({
      where: {
        createdAt: { gte: subMonths(new Date(), 6) }
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.post.aggregate({ _sum: { impressions: true } }),
    prisma.post.aggregate({ _sum: { clicks: true } }),
    prisma.post.aggregate({ _sum: { shares: true } }),
  ]);

  // Process User Growth Chart Data
  const last6Months = Array.from({ length: 7 }, (_, i) => {
    const d = subMonths(new Date(), 6 - i);
    return { name: format(d, "MMM"), users: 0, timestamp: d };
  });

  monthlyUsersRaw.forEach(user => {
    const monthName = format(user.createdAt, "MMM");
    const dataPoint = last6Months.find(m => m.name === monthName);
    if (dataPoint) dataPoint.users++;
  });

  let cumulative = Math.max(totalUsers - monthlyUsersRaw.length, 0);
  const chartData = last6Months.map(m => {
    cumulative += m.users;
    return { name: m.name, users: cumulative };
  });

  const pieData = socialPostsByPlatform.length > 0
    ? socialPostsByPlatform.map(p => ({
        name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
        value: p._count,
      }))
    : [
        { name: "X (Twitter)", value: 0 },
        { name: "Instagram", value: 0 },
        { name: "LinkedIn", value: 0 },
      ];

  const totalImpressions = impressionsAgg._sum.impressions ?? 0;
  const totalClicks = clicksAgg._sum.clicks ?? 0;
  const totalShares = sharesAgg._sum.shares ?? 0;
  const clickRate = totalImpressions > 0
    ? ((totalClicks / totalImpressions) * 100).toFixed(1) + "%"
    : "0%";

  const totals = {
    views: totalImpressions.toLocaleString(),
    clicks: clickRate,
    shares: totalShares.toLocaleString(),
    users: totalUsers.toString(),
  };

  return (
    <AnalyticsClient
      chartData={chartData}
      pieData={pieData}
      totals={totals}
    />
  );
}
