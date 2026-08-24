"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SystemHealth {
  activeJobs: number;
  queueLength: number;
  averageProcessingTime: number;
  successRate: number;
  recentActivity: number;
  errorRate: number;
}

interface SystemStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}

interface ProviderStat {
  provider: string;
  _count: { id: number };
}

interface RecentActivity {
  id: string;
  status: string;
  provider: string;
  createdAt: string;
  completedAt?: string;
  processingTime?: number;
}

interface SystemHealthResponse {
  health: SystemHealth;
  stats: SystemStats;
  providers: ProviderStat[];
  recentActivity: RecentActivity[];
  timestamp: string;
}

const createSystemApi = () => ({
  getHealth: (): Promise<SystemHealthResponse> =>
    fetch('/api/video/system/health').then(res => {
      if (!res.ok) throw new Error('Failed to fetch system health');
      return res.json();
    }),

  performSystemAction: (action: 'cleanup' | 'reset_failed') =>
    fetch('/api/video/system/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to perform system action');
      return res.json();
    })
});

export const useSystemHealth = () => {
  const api = createSystemApi();

  return useQuery({
    queryKey: ['system-health'],
    queryFn: api.getHealth,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    retry: 2,
  });
};

export const useSystemActions = () => {
  const queryClient = useQueryClient();
  const api = createSystemApi();

  const cleanupMutation = useMutation({
    mutationFn: () => api.performSystemAction('cleanup'),
    onSuccess: (data) => {
      toast.success(`System cleanup completed: ${data.deletedCount} jobs removed`);
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
    },
    onError: (error: any) => {
      toast.error(`Cleanup failed: ${error.message}`);
    }
  });

  const resetFailedMutation = useMutation({
    mutationFn: () => api.performSystemAction('reset_failed'),
    onSuccess: (data) => {
      toast.success(`Reset ${data.resetCount} failed jobs to pending`);
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
    },
    onError: (error: any) => {
      toast.error(`Reset failed: ${error.message}`);
    }
  });

  return {
    cleanup: cleanupMutation.mutate,
    resetFailed: resetFailedMutation.mutate,
    isCleaningUp: cleanupMutation.isPending,
    isResetting: resetFailedMutation.isPending
  };
};

// Utility hook for system monitoring alerts
export const useSystemAlerts = () => {
  const { data: health } = useSystemHealth();

  const getAlerts = () => {
    if (!health) return [];

    const alerts = [];

    // High error rate alert
    if (health.health.errorRate > 20) {
      alerts.push({
        type: 'error' as const,
        message: `High error rate: ${health.health.errorRate}%`,
        description: 'System experiencing elevated failure rates'
      });
    }

    // Low success rate alert
    if (health.health.successRate < 80) {
      alerts.push({
        type: 'warning' as const,
        message: `Low success rate: ${health.health.successRate}%`,
        description: 'Video generation success rate below optimal threshold'
      });
    }

    // Queue buildup alert
    if (health.health.queueLength > 10) {
      alerts.push({
        type: 'warning' as const,
        message: `Queue buildup: ${health.health.queueLength} jobs`,
        description: 'Processing queue is getting long'
      });
    }

    // Slow processing alert
    if (health.health.averageProcessingTime > 10) {
      alerts.push({
        type: 'info' as const,
        message: `Slow processing: ${health.health.averageProcessingTime}min avg`,
        description: 'Processing time is longer than usual'
      });
    }

    return alerts;
  };

  return {
    alerts: getAlerts(),
    hasAlerts: getAlerts().length > 0,
    criticalAlerts: getAlerts().filter(alert => alert.type === 'error'),
    warningAlerts: getAlerts().filter(alert => alert.type === 'warning')
  };
};
