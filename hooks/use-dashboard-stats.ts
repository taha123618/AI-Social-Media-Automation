"use client"
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface DashboardMetric {
  label: string;
  value: string;
}

interface DashboardData {
  metrics: DashboardMetric[];
  workflows: unknown[];
  workflowStats?: {
    total: number;
    active: number;
    recentExecutions: number;
    successRate: string;
  };
  recentAutomations?: Array<{
    id: string;
    workflowName: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
  }>;
  brandHealth?: {
    score: number;
    engagement: number;
    consistency: number;
    reach: number;
  };
}

export const useDashboardStats = (businessId?: string | null) => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-stats', businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error('No business ID found');
      }

      const response = await fetch(
        `${API_URL}/api/dashboard?businessId=${businessId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      return response.json();
    },
    enabled: !!businessId,
    staleTime: 30 * 1000, // 30 seconds to match API cache
    refetchOnWindowFocus: false,
  });
};
