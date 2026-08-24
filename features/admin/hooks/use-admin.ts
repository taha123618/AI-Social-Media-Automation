"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useAdminStats() {
  return useSWR("/api/admin/stats", fetcher, {
    refreshInterval: 60000,
    fallbackData: {
      totalUsers: 0,
      totalPosts: 0,
      totalBusinesses: 0,
      totalAdmins: 0,
      totalBlogArticles: 0,
      totalWorkflows: 0,
      totalSocialAccounts: 0,
      usersLast30: 0,
      postsLast30: 0,
    },
  });
}

export function useDashboardChartData() {
  return useSWR("/api/admin/charts/dashboard", fetcher, {
    refreshInterval: 120000,
    fallbackData: [],
  });
}

export function useAnalyticsTotals() {
  return useSWR("/api/admin/analytics/totals", fetcher, {
    refreshInterval: 120000,
    fallbackData: {
      views: "0",
      clicks: "0%",
      shares: "0",
      likes: "0",
      comments: "0",
      engagement: "0",
    },
  });
}

export function useBlogDashboardStats() {
  return useSWR("/api/admin/blog/stats", fetcher, {
    refreshInterval: 120000,
    fallbackData: null,
  });
}

export function usePostEngagement(days: number = 30) {
  return useSWR(`/api/admin/analytics/engagement?days=${days}`, fetcher, {
    refreshInterval: 120000,
    fallbackData: [],
  });
}

export function useRecentSecurityEvents(limit: number = 10) {
  return useSWR(`/api/admin/security/events?limit=${limit}`, fetcher, {
    refreshInterval: 30000,
    fallbackData: [],
  });
}
