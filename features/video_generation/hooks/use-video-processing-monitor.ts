"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface VideoProcessingStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

interface UseVideoProcessingMonitorOptions {
  jobId: string;
  businessId: string;
  onStatusChange?: (status: VideoProcessingStatus) => void;
  onComplete?: (status: VideoProcessingStatus) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export const useVideoProcessingMonitor = ({
  jobId,
  businessId,
  onStatusChange,
  onComplete,
  onError,
  enabled = true
}: UseVideoProcessingMonitorOptions) => {
  const [status, setStatus] = useState<VideoProcessingStatus>({
    jobId,
    status: 'pending',
    progress: 0,
    message: 'Initializing...'
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const updateStatus = useCallback((newStatus: Partial<VideoProcessingStatus>) => {
    const updated = { ...status, ...newStatus, lastUpdate: new Date() } as VideoProcessingStatus;
    setStatus(updated);
    setLastUpdate(new Date());
    onStatusChange?.(updated);
  }, [status, onStatusChange]);

  const checkStatus = useCallback(async () => {
    if (!jobId || !businessId || !enabled) return;

    try {
      const response = await fetch(`/api/video/status/${jobId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Map API status to our status format
      let mappedStatus: VideoProcessingStatus['status'] = 'pending';
      let progress = 0;
      let message = 'Processing...';

      switch (data.status) {
        case 'PENDING':
          mappedStatus = 'pending';
          progress = 10;
          message = 'Queued for processing...';
          break;
        case 'PROCESSING':
          mappedStatus = 'processing';
          progress = 50;
          message = 'Generating video...';
          break;
        case 'COMPLETED':
          mappedStatus = 'completed';
          progress = 100;
          message = 'Video generation completed!';
          break;
        case 'FAILED':
          mappedStatus = 'failed';
          progress = 0;
          message = 'Video generation failed';
          break;
      }

      const newStatus: VideoProcessingStatus = {
        jobId,
        status: mappedStatus,
        progress,
        message,
        error: data.error,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl
      };

      updateStatus(newStatus);

      // Handle completion
      if (mappedStatus === 'completed') {
        onComplete?.(newStatus);
        setIsMonitoring(false);
        toast.success('Video generation completed successfully!');
      } else if (mappedStatus === 'failed') {
        onError?.(data.error || 'Unknown error');
        setIsMonitoring(false);
        toast.error(`Video generation failed: ${data.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Status check failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check status';

      updateStatus({
        status: 'failed',
        message: 'Status check failed',
        error: errorMessage
      });

      onError?.(errorMessage);
      setIsMonitoring(false);
    }
  }, [jobId, businessId, enabled, updateStatus, onComplete, onError]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!jobId || !businessId || !enabled || isMonitoring) return;

    setIsMonitoring(true);
    updateStatus({
      status: 'pending',
      progress: 0,
      message: 'Starting monitoring...'
    });
  }, [jobId, businessId, enabled, isMonitoring, updateStatus]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Auto-polling effect
  useEffect(() => {
    if (!isMonitoring || !enabled) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 3000); // Check every 3 seconds

    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, [isMonitoring, enabled, checkStatus]);

  // Auto-start when jobId changes
  useEffect(() => {
    if (jobId && businessId && enabled) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [jobId, businessId, enabled, startMonitoring, stopMonitoring]);

  return {
    status,
    isMonitoring,
    lastUpdate,
    startMonitoring,
    stopMonitoring,
    checkStatus
  };
};

// Utility hook for monitoring multiple video jobs
export const useMultiVideoMonitor = (jobIds: string[], businessId: string) => {
  const [statuses, setStatuses] = useState<Map<string, VideoProcessingStatus>>(new Map());

  const updateJobStatus = useCallback((jobId: string, status: VideoProcessingStatus) => {
    setStatuses(prev => new Map(prev.set(jobId, status)));
  }, []);

  const monitors = jobIds.map(jobId =>
    useVideoProcessingMonitor({
      jobId,
      businessId,
      onStatusChange: (status) => updateJobStatus(jobId, status),
      enabled: !!jobId
    })
  );

  const getActiveJobs = useCallback(() => {
    return Array.from(statuses.values()).filter(
      status => status.status === 'pending' || status.status === 'processing'
    );
  }, [statuses]);

  const getCompletedJobs = useCallback(() => {
    return Array.from(statuses.values()).filter(
      status => status.status === 'completed'
    );
  }, [statuses]);

  const getFailedJobs = useCallback(() => {
    return Array.from(statuses.values()).filter(
      status => status.status === 'failed'
    );
  }, [statuses]);

  const overallProgress = useCallback(() => {
    if (jobIds.length === 0) return 0;
    const totalProgress = Array.from(statuses.values()).reduce(
      (sum, status) => sum + status.progress, 0
    );
    return Math.round(totalProgress / jobIds.length);
  }, [jobIds.length, statuses]);

  return {
    monitors,
    statuses: Object.fromEntries(statuses),
    activeJobs: getActiveJobs(),
    completedJobs: getCompletedJobs(),
    failedJobs: getFailedJobs(),
    overallProgress: overallProgress(),
    isAnyActive: getActiveJobs().length > 0
  };
};
