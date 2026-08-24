"use client";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface VideoOptimizationOptions {
  priority?: 'low' | 'normal' | 'high';
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp4' | 'webm' | 'avi';
  compression?: boolean;
}

interface VideoBatchOptions {
  includeThumbnails?: boolean;
  format?: 'original' | 'mp4' | 'webm';
  compression?: 'none' | 'low' | 'medium' | 'high';
}

interface BatchDownloadRequest {
  videoIds: string[];
  options?: VideoBatchOptions;
}

interface BatchDownloadResponse {
  batchId: string;
  videos: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    prompt: string;
    duration: number;
    quality: string;
    createdAt: string;
  }>;
  totalVideos: number;
  options: VideoBatchOptions;
  createdAt: string;
  estimatedSize: string;
  downloadUrl: string;
}

interface OptimizationResult {
  originalUrl: string;
  optimizedUrls: {
    web: string;
    mobile: string;
    thumbnail?: string;
  };
  optimizations: Array<{
    type: string;
    originalSize: string;
    optimizedSize: string;
    savings: string;
  }>;
  processingTime: string;
  priority: string;
}

const createVideoAdvancedApi = (businessId: string) => ({
  optimizeVideo: (videoId: string, options: VideoOptimizationOptions = {}) =>
    fetch(`/api/video/${videoId}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId
      },
      body: JSON.stringify(options)
    }).then(res => {
      if (!res.ok) throw new Error('Failed to optimize video');
      return res.json();
    }),

  createBatchDownload: (request: BatchDownloadRequest) =>
    fetch('/api/video/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId
      },
      body: JSON.stringify(request)
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create batch download');
      return res.json() as Promise<BatchDownloadResponse>;
    }),

  getBatchDownload: (batchId: string) =>
    fetch(`/api/video/batch/${batchId}`, {
      headers: {
        'x-business-id': businessId
      }
    }).then(res => {
      if (!res.ok) throw new Error('Failed to get batch download');
      return res.blob();
    })
});

export const useVideoOptimization = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createVideoAdvancedApi(businessId);

  return useMutation({
    mutationFn: ({ videoId, options }: { videoId: string; options?: VideoOptimizationOptions }) =>
      api.optimizeVideo(videoId, options),
    onSuccess: (data, variables) => {
      toast.success(`Video optimization completed for ${variables.videoId}`);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['video-jobs', businessId] });
    },
    onError: (error: any) => {
      toast.error(`Video optimization failed: ${error.message}`);
    }
  });
};

export const useBatchDownload = (businessId: string) => {
  const api = createVideoAdvancedApi(businessId);

  return useMutation({
    mutationFn: (request: BatchDownloadRequest) => api.createBatchDownload(request),
    onSuccess: (data: BatchDownloadResponse) => {
      toast.success(`Batch download created for ${data.totalVideos} videos`);

      // Log the batch creation
      console.log('Batch download created:', data.batchId);

      // Optionally trigger download automatically
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to create batch download: ${error.message}`);
    }
  });
};

export const useVideoAdvancedOperations = (businessId: string) => {
  const optimizeVideo = useVideoOptimization(businessId);
  const batchDownload = useBatchDownload(businessId);

  return {
    optimizeVideo,
    batchDownload,
    isOptimizing: optimizeVideo.isPending,
    isCreatingBatch: batchDownload.isPending
  };
};

// Utility hook for video file operations
export const useVideoFileOperations = () => {
  const downloadVideo = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  };

  const copyVideoUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  };

  const shareVideo = async (url: string, title?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check out this video',
          url: url
        });
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    return false;
  };

  return {
    downloadVideo,
    copyVideoUrl,
    shareVideo
  };
};
