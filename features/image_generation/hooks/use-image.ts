'use client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageGenerationRequestInput, ImageGenerationResponse, ImageGenerationJob, BrandFilterOptions } from "@/features/image_generation/types";

// API functions
const fetchImageJobs = async (businessId?: string, userId?: string): Promise<ImageGenerationJob[]> => {
  const params = new URLSearchParams();
  if (businessId) params.append('businessId', businessId);
  if (userId) params.append('userId', userId);

  const response = await fetch(`/api/image/jobs?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch image jobs');
  }
  const data = await response.json();
  return data.success ? data.data : [];
};

const generateImage = async (data: ImageGenerationRequestInput): Promise<ImageGenerationResponse> => {
  const payload = { ...data };

  const response = await fetch('/api/image/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate image');
  }

  const result = await response.json();
  return result.success ? result.data : result;
};

const applyImageBrandFilters = async (businessId: string, imageUrl: string, options: BrandFilterOptions): Promise<{ imageUrl: string }> => {
  const response = await fetch('/api/image/brand-filters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-business-id': businessId
    },
    body: JSON.stringify({ imageUrl, options }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to apply brand filters');
  }

  const result = await response.json();
  return result.success ? result.data : result;
};

// Hooks
export const useImageJobs = (businessId?: string, userId?: string) => {
  const queryKey = userId ? ['image-jobs', 'user', userId] : ['image-jobs', 'business', businessId];

  return useQuery({
    queryKey,
    queryFn: () => fetchImageJobs(businessId, userId),
    enabled: !!(businessId || userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 500, // Refresh every 0.5 seconds for real-time updates
  });
};

export const useGenerateImage = (businessId?: string, userId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = userId ? ['image-jobs', 'user', userId] : ['image-jobs', 'business', businessId];

  return useMutation({
    mutationFn: (data: ImageGenerationRequestInput) => generateImage(data),
    onSuccess: () => {
      // Invalidate and refetch image jobs
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      console.error('Image generation error:', error);
      toast.error(error.message || 'Failed to generate image');
    },
  });
};

export const useApplyImageBrandFilters = (businessId: string) => {
  return useMutation({
    mutationFn: ({ imageUrl, options }: { imageUrl: string; options: BrandFilterOptions }) =>
      applyImageBrandFilters(businessId, imageUrl, options),
  });
};
