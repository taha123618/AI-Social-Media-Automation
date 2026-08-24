"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { VideoGenerationRequestInput, VideoStatusResponse, RagVideoRequest, BrandFilterOptions, VideoJob, WorkerStats } from '@/features/video_generation/types';



// API Client
const createVideoApi = (businessId: string) => ({
  generate: (data: VideoGenerationRequestInput): Promise<VideoStatusResponse> =>
    axios.post<VideoStatusResponse>('/api/video/generate', data, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  generateRag: (data: RagVideoRequest): Promise<VideoStatusResponse> =>
    axios.post<VideoStatusResponse>('/api/video/rag-generate', data, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  getStatus: (jobId: string): Promise<VideoStatusResponse> =>
    axios.get<VideoStatusResponse>(`/api/video/status/${jobId}`, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  getJobs: (): Promise<VideoJob[]> =>
    axios.get<{ jobs: VideoJob[] }>('/api/video/jobs', {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data.jobs),

  cancelJob: (jobId: string): Promise<VideoStatusResponse> =>
    axios.post<VideoStatusResponse>(`/api/video/cancel/${jobId}`, {}, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  getGallery: (): Promise<VideoJob[]> =>
    axios.get<{ jobs: VideoJob[] }>('/api/video/gallery', {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data.jobs),

  applyFilters: (videoUrl: string, options: BrandFilterOptions): Promise<{ videoUrl: string }> =>
    axios.post<{ videoUrl: string }>('/api/video/brand-filters', { videoUrl, options }, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data)
});

// Type guard for axios errors
function isAxiosError(error: unknown): error is { response?: { status?: number } } {
  return Boolean(error && typeof error === 'object' && 'response' in error);
}

function isAxiosErrorWithData(error: unknown): error is { response?: { data?: { error?: string } } } {
  return Boolean(error && typeof error === 'object' && 'response' in error);
}

// Gallery API function
export const getGallery = async (businessId: string): Promise<VideoJob[]> => {
  const response = await axios.get<{ jobs: VideoJob[] }>('/api/video/gallery', {
    headers: { 'x-business-id': businessId }
  });
  return response.data.jobs;
};

// React Query Hooks
export const useVideoJobs = (businessId: string) => {
  const api = createVideoApi(businessId);
  return useQuery<VideoJob[]>({
    queryKey: ['video-jobs', businessId],
    queryFn: api.getJobs,
    staleTime: 15000, // 15 seconds - balanced for performance
    refetchInterval: (query) => {
      // Dynamic refetch: faster when there are active jobs
      const data = query.state.data as VideoJob[] | undefined;
      const hasActiveJobs = data && data.length > 0
        ? data.some((job) => job.status === 'processing' || job.status === 'pending')
        : false;
      return hasActiveJobs ? 500 : 30000; // 0.5s for active, 30s for idle
    },
    enabled: !!businessId,
    retry: (failureCount, error: unknown) => {
      // Retry on network errors but not on 4xx errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

export const useVideoStatus = (businessId: string, jobId: string) => {
  const api = createVideoApi(businessId);
  return useQuery<VideoStatusResponse>({
    queryKey: ['video-status', businessId, jobId],
    queryFn: () => api.getStatus(jobId),
    enabled: !!jobId && !!businessId,
    staleTime: 3000, // 3 seconds for real-time updates
    refetchInterval: (query) => {
      // Smart polling: slower for completed/failed jobs
      const data = query.state.data as VideoStatusResponse | undefined;
      if (!data) return 500; // Poll quickly initially
      if (data.status === 'completed' || data.status === 'failed') {
        return false; // Stop polling for finished jobs
      }
      // Aggressive polling for active jobs
      return 500;
    },
    retry: (failureCount, error: unknown) => {
      if (isAxiosError(error)) {
        if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

export const useGenerateVideo = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createVideoApi(businessId);

  return useMutation({
    mutationFn: api.generate,
    onSuccess: () => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['video-jobs', businessId] });
    },
    onError: (error: unknown) => {
      // Handle specific prompt limit errors
      if (isAxiosErrorWithData(error)) {
        if (error.response?.data?.error?.includes('truncated')) {
          console.warn('Prompt was truncated to fit API limits');
        }

        // Handle Runway API validation errors
        if (error.response?.data?.error?.includes('Validation of body failed')) {
          console.error('Runway API validation error:', error.response.data.error);
        }
      }
    },
  });
};

export const useGenerateRagVideo = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createVideoApi(businessId);

  return useMutation({
    mutationFn: api.generateRag,
    onSuccess: () => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['video-jobs', businessId] });
    },
    onError: (error: unknown) => {
      // Handle specific prompt limit errors
      if (isAxiosErrorWithData(error)) {
        if (error.response?.data?.error?.includes('truncated')) {
          console.warn('Prompt was truncated to fit API limits');
        }

        // Handle Runway API validation errors
        if (error.response?.data?.error?.includes('Validation of body failed')) {
          console.error('Runway API validation error:', error.response.data.error);
        }
      }
    },
  });
};

export const useCancelVideoJob = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createVideoApi(businessId);

  return useMutation({
    mutationFn: api.cancelJob,
    onSuccess: () => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['video-jobs', businessId] });
      queryClient.invalidateQueries({ queryKey: ['video-status', businessId] });
    },
  });
};

export const useApplyBrandFilters = (businessId: string) => {
  const api = createVideoApi(businessId);
  return useMutation({
    mutationFn: ({ videoUrl, options }: { videoUrl: string; options: BrandFilterOptions }) =>
      api.applyFilters(videoUrl, options),
  });
};

// Utility hook for polling job status with optimized performance
export const useVideoJobPolling = (businessId: string, jobId: string, onComplete?: (status: VideoStatusResponse) => void) => {
  const api = createVideoApi(businessId);

  return useQuery<VideoStatusResponse>({
    queryKey: ['video-job-polling', businessId, jobId],
    queryFn: async () => {
      const status = await api.getStatus(jobId);

      // If job is completed or failed, call onComplete callback
      if ((status.status === 'completed' || status.status === 'failed') && onComplete) {
        onComplete(status);
      }

      return status;
    },
    enabled: !!jobId && !!businessId,
    staleTime: 2000, // 2 seconds for responsive updates
    refetchInterval: (query) => {
      const data = query.state.data as VideoStatusResponse | undefined;
      if (!data) return 500;
      if (data.status === 'completed' || data.status === 'failed') {
        return false; // Stop polling
      }
      return 500; // Adaptive polling
    },
    retry: false, // Don't retry polling to avoid excessive requests
  });
};

// Video Worker Management Hooks
export const useVideoWorkerStats = () => {
  return useQuery<WorkerStats>({
    queryKey: ['video-worker-stats'],
    queryFn: async () => {
      const response = await fetch('/api/video/worker', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch worker stats');
      }

      const data = await response.json();
      return data.stats;
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useVideoWorkerActions = () => {
  const queryClient = useQueryClient();

  const addPendingJobs = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/video/worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addPendingJobs'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add pending jobs');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh video jobs list and worker stats
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['video-worker-stats'] });
    },
  });

  const addJobToQueue = useMutation({
    mutationFn: async ({ jobId, businessId }: { jobId: string; businessId: string }) => {
      const response = await fetch('/api/video/worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addJob',
          jobId,
          businessId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add job to queue');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh video jobs list and worker stats
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['video-worker-stats'] });
    },
  });

  const getWorkerStats = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/video/worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStats'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get worker stats');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh worker stats
      queryClient.invalidateQueries({ queryKey: ['video-worker-stats'] });
    },
  });

  return {
    addPendingJobs,
    addJobToQueue,
    getWorkerStats,
  };
};