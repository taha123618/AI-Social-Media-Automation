import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// ============= CONTENTS HOOKS =============

export const useContents = (businessId: string, options?: any) => {
  return useQuery({
    queryKey: ['contents', businessId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/api/contents?${new URLSearchParams({ businessId })}`,
        {
          headers: {
            'x-business-id': businessId,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch contents');
      return res.json();
    },
    ...options,
  });
};

export const useGenerateContent = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to generate content');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents', businessId] });
    },
  });
};

// ============= POSTS HOOKS =============

export const usePosts = (businessId: string, filters?: {
  status?: string;
  platform?: string;
  search?: string;
  skip?: number;
  take?: number;
}) => {
  return useQuery({
    queryKey: ['posts', businessId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.platform) params.append('platform', filters.platform);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
      if (filters?.take !== undefined) params.append('take', filters.take.toString());

      const response = await axios.get(`${API_URL}/api/posts?${params}`, {
        headers: {
          'x-business-id': businessId,
        },
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!businessId,
  });
};

// ============= WORKFLOWS HOOKS =============

export const useWorkflows = (businessId: string, status?: string) => {
  return useQuery({
    queryKey: ['workflows', businessId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const res = await fetch(`${API_URL}/api/workflows?${params}`, {
        headers: {
          'x-business-id': businessId,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch workflows');
      return res.json();
    },
  });
};

export const useApprovalAction = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      draftId: string;
      action: 'submit' | 'approve' | 'reject' | 'schedule';
      comment?: string;
      scheduledTime?: string;
    }) => {
      const res = await fetch(
        `${API_URL}/api/workflows?draftId=${data.draftId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-business-id': businessId,
          },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to perform action');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
};

// ============= SCHEDULE HOOKS =============

export const useScheduledPosts = (businessId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['schedule', businessId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${API_URL}/api/schedule?${params}`, {
        headers: {
          'x-business-id': businessId,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch scheduled posts');
      return res.json();
    },
  });
};

export const useSchedulePost = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { draftId: string; scheduledTime: string }) => {
      const res = await fetch(`${API_URL}/api/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to schedule post');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
};

export const useUnschedulePost = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draftId: string) => {
      const res = await fetch(`${API_URL}/api/schedule?draftId=${draftId}`, {
        method: 'DELETE',
        headers: {
          'x-business-id': businessId,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to unschedule post');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

// ============= TEAM HOOKS =============

export const useTeamMembers = (businessId: string) => {
  return useQuery({
    queryKey: ['team', businessId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/team`, {
        headers: {
          'x-business-id': businessId,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch team members');
      return res.json();
    },
  });
};

export const useInviteMember = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await fetch(`${API_URL}/api/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invite member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};

export const useUpdateMemberRole = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { memberId: string; role: string }) => {
      const res = await fetch(
        `${API_URL}/api/team/${data.memberId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-business-id': businessId,
          },
          body: JSON.stringify({ role: data.role }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update member role');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};

export const useRemoveMember = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(
        `${API_URL}/api/team/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'x-business-id': businessId,
          },
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};

// ============= SETTINGS HOOKS =============

export const useSettings = (businessId: string) => {
  return useQuery({
    queryKey: ['settings', businessId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/settings`, {
        headers: {
          'x-business-id': businessId,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });
};

export const useUpdateSettings = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { type: 'business' | 'profile'; data: any }) => {
      const res = await fetch(
        `${API_URL}/api/settings?type=${data.type}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-business-id': businessId,
          },
          body: JSON.stringify(data.data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update settings');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

// ============= REVIEWS HOOKS =============

export const useReviews = (businessId: string, status?: string) => {
  return useQuery({
    queryKey: ['reviews', businessId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const res = await fetch(`${API_URL}/api/reviews?businessId=${businessId}&${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!businessId,
  });
};

export const useReviewRequest = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      channel: 'EMAIL' | 'SMS';
      customMessage?: string;
    }) => {
      const res = await fetch(`${API_URL}/api/reviews/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, businessId }),
      });
      console.log('Review request response:', res);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send review request');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useGenerateReviewResponse = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`${API_URL}/api/reviews/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, businessId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate response');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useConvertReviewToPost = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`${API_URL}/api/reviews/convert-to-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, businessId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to convert review to post');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
};

// ============= ANALYTICS HOOKS =============

export const useAnalyticsOverview = (businessId: string, days?: number) => {
  return useQuery({
    queryKey: ['analytics', 'overview', businessId, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('businessId', businessId);
      if (days) params.append('days', days.toString());

      const res = await fetch(`${API_URL}/api/analytics/overview?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics overview');
      return res.json();
    },
    enabled: !!businessId,
  });
};

export const useConsistencyScore = (businessId: string, days?: number) => {
  return useQuery({
    queryKey: ['analytics', 'consistency', businessId, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('businessId', businessId);
      if (days) params.append('days', days.toString());

      const res = await fetch(`${API_URL}/api/analytics/consistency?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch consistency score');
      return res.json();
    },
    enabled: !!businessId,
  });
};

export const useLeadAnalytics = (businessId: string, days?: number) => {
  return useQuery({
    queryKey: ['analytics', 'leads', businessId, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('businessId', businessId);
      if (days) params.append('days', days.toString());

      const res = await fetch(`${API_URL}/api/analytics/leads?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch lead analytics');
      return res.json();
    },
    enabled: !!businessId,
  });
};

export const useTrackLead = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      postId: string;
      leadType: string;
      metadata?: any;
    }) => {
      const res = await fetch(`${API_URL}/api/analytics/leads/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, businessId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to track lead');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useAnalyticsInsights = (businessId: string, days?: number) => {
  return useQuery({
    queryKey: ['analytics', 'insights', businessId, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('businessId', businessId);
      if (days) params.append('days', days.toString());

      const res = await fetch(`${API_URL}/api/analytics/insights?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics insights');
      return res.json();
    },
    enabled: !!businessId,
  });
};

export const useAnalyticsPerformance = (businessId: string, days?: number) => {
  return useQuery({
    queryKey: ['analytics', 'performance', businessId, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('businessId', businessId);
      if (days) params.append('days', days.toString());

      const res = await fetch(`${API_URL}/api/analytics/performance?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch performance metrics');
      return res.json();
    },
    enabled: !!businessId,
  });
};

export const useGrowthAnalytics = (businessId: string) => {
  return useQuery({
    queryKey: ['analytics', 'growth', businessId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/analytics/growth?businessId=${businessId}`);
      if (!res.ok) throw new Error('Failed to fetch growth analytics');
      return res.json();
    },
    enabled: !!businessId,
  });
};

export const useSendFollowUp = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { requestId?: string; bulk?: boolean; daysAgo?: number }) => {
      const res = await fetch(`${API_URL}/api/reviews/request/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, businessId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send follow-up');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useSendReviewResponseEmail = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`${API_URL}/api/reviews/send-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, businessId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send response email');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
