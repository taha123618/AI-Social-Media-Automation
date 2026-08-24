"use client";
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

interface VideoAnalytics {
  totalVideos: number;
  completedVideos: number;
  failedVideos: number;
  processingVideos: number;
  pendingVideos: number;
  successRate: number;
  averageProcessingTime: number;
  totalCreditsUsed: number;
  mostUsedProvider: string;
  mostUsedStyle: string;
  generationTrend: {
    date: string;
    count: number;
  }[];
}


interface VideoUsageStats {
  jobId: string;
  provider: string;
  style: string;
  duration: number;
  quality: string;
  creditsUsed: number;
  processingTime: number;
  createdAt: string;
  status: string;
}

const createAnalyticsApi = (businessId: string) => ({
  getAnalytics: (): Promise<VideoAnalytics> =>
    fetch(`/api/video/analytics`, {
      headers: { 'x-business-id': businessId }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    }),

  getUsageStats: (): Promise<VideoUsageStats[]> =>
    fetch(`/api/video/analytics/usage`, {
      headers: { 'x-business-id': businessId }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch usage stats');
      return res.json();
    }),

  trackEvent: (event: {
    action: string;
    entityId?: string;
    details?: Record<string, any>;
  }): Promise<void> =>
    fetch(`/api/video/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId
      },
      body: JSON.stringify(event)
    }).then(res => {
      if (!res.ok) throw new Error('Failed to track event');
    }),

  exportData: (format: 'csv' | 'json'): Promise<Blob> =>
    fetch(`/api/video/analytics/export?format=${format}`, {
      headers: { 'x-business-id': businessId }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to export data');
      return res.blob();
    })
});

export const useVideoAnalytics = (businessId: string) => {
  const api = createAnalyticsApi(businessId);

  return useQuery({
    queryKey: ['video-analytics', businessId],
    queryFn: api.getAnalytics,
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useVideoUsageStats = (businessId: string) => {
  const api = createAnalyticsApi(businessId);

  return useQuery({
    queryKey: ['video-usage-stats', businessId],
    queryFn: api.getUsageStats,
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useVideoAnalyticsTracking = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createAnalyticsApi(businessId);

  const trackMutation = useMutation({
    mutationFn: api.trackEvent,
    onSuccess: () => {
      // Invalidate analytics cache to reflect new data
      queryClient.invalidateQueries({ queryKey: ['video-analytics', businessId] });
      queryClient.invalidateQueries({ queryKey: ['video-usage-stats', businessId] });
    },
    onError: (error) => {
      console.warn('Failed to track analytics event:', error);
    }
  });

  const trackEvent = useCallback((action: string, entityId?: string, details?: Record<string, any>) => {
    trackMutation.mutate({
      action,
      entityId,
      details
    });
  }, [trackMutation]);

  // Predefined tracking methods
  const trackVideoGeneration = useCallback((jobId: string, details: {
    provider: string;
    style: string;
    duration: number;
    quality: string;
  }) => {
    trackEvent('VIDEO_GENERATION_STARTED', jobId, details);
  }, [trackEvent]);

  const trackVideoCompleted = useCallback((jobId: string, details: {
    processingTime: number;
    creditsUsed: number;
  }) => {
    trackEvent('VIDEO_GENERATION_COMPLETED', jobId, details);
  }, [trackEvent]);

  const trackVideoFailed = useCallback((jobId: string, details: {
    error: string;
    processingTime: number;
  }) => {
    trackEvent('VIDEO_GENERATION_FAILED', jobId, details);
  }, [trackEvent]);

  const trackVideoDownload = useCallback((jobId: string, details: {
    format: string;
    size?: number;
  }) => {
    trackEvent('VIDEO_DOWNLOADED', jobId, details);
  }, [trackEvent]);

  const trackBrandFiltersApplied = useCallback((jobId: string, details: {
    filters: string[];
    platform?: string;
  }) => {
    trackEvent('BRAND_FILTERS_APPLIED', jobId, details);
  }, [trackEvent]);

  const trackVideoView = useCallback((jobId: string, details: {
    source: 'gallery' | 'direct' | 'preview';
    duration?: number;
  }) => {
    trackEvent('VIDEO_VIEWED', jobId, details);
  }, [trackEvent]);

  return {
    trackEvent,
    trackVideoGeneration,
    trackVideoCompleted,
    trackVideoFailed,
    trackVideoDownload,
    trackBrandFiltersApplied,
    trackVideoView,
    isLoading: trackMutation.isPending
  };
};

export const useVideoAnalyticsExport = (businessId: string) => {
  const api = createAnalyticsApi(businessId);

  const exportMutation = useMutation({
    mutationFn: ({ format }: { format: 'csv' | 'json' }) => api.exportData(format),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-analytics-${new Date().toISOString().split('T')[0]}.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Analytics exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error) => {
      toast.error('Failed to export analytics');
      console.error('Export failed:', error);
    }
  });

  return {
    exportData: exportMutation.mutate,
    isLoading: exportMutation.isPending
  };
};

// Utility hook for calculating video metrics
export const useVideoMetrics = (usageStats: VideoUsageStats[]) => {
  const calculateMetrics = useCallback(() => {
    if (!usageStats.length) {
      return {
        successRate: 0,
        averageProcessingTime: 0,
        totalCreditsUsed: 0,
        mostUsedProvider: 'N/A',
        mostUsedStyle: 'N/A',
        averageDuration: 0
      };
    }

    const completed = usageStats.filter(stat => stat.status === 'completed');
    const successRate = (completed.length / usageStats.length) * 100;

    const averageProcessingTime = completed.length > 0
      ? completed.reduce((sum, stat) => sum + stat.processingTime, 0) / completed.length
      : 0;

    const totalCreditsUsed = usageStats.reduce((sum, stat) => sum + stat.creditsUsed, 0);

    const providerCounts = usageStats.reduce((acc, stat) => {
      acc[stat.provider] = (acc[stat.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUsedProvider = Object.entries(providerCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const styleCounts = usageStats.reduce((acc, stat) => {
      acc[stat.style] = (acc[stat.style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUsedStyle = Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const averageDuration = usageStats.reduce((sum, stat) => sum + stat.duration, 0) / usageStats.length;

    return {
      successRate,
      averageProcessingTime,
      totalCreditsUsed,
      mostUsedProvider,
      mostUsedStyle,
      averageDuration
    };
  }, [usageStats]);

  return calculateMetrics();
};
