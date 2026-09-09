import { http } from './client';
import { Post, CreatePostPayload, SocialPlatform } from '@/types/api';

export const postsApi = {
  getPosts: async (status?: string): Promise<Post[]> => {
    try {
      const queryParam = status && status !== 'ALL' ? `?status=${status}` : '';
      const res = await http.get<{ success: boolean; data?: any; posts?: any[] }>(`/api/posts${queryParam}`);
      const rawList = res.posts || res.data?.posts || (Array.isArray(res.data) ? res.data : []);

      if (Array.isArray(rawList)) {
        return rawList.map((p: any) => ({
          id: p.id,
          content: p.content || p.draft?.content || p.text || '',
          platforms: (p.platforms || [p.platform || 'linkedin']).map((plat: string) => plat.toLowerCase() as SocialPlatform),
          status: (p.status === 'POSTED' ? 'PUBLISHED' : p.status || 'SCHEDULED') as Post['status'],
          scheduledFor: p.scheduledFor || p.postedAt || p.createdAt || new Date().toISOString(),
          publishedAt: p.publishedAt || p.postedAt,
          mediaUrl: p.mediaUrl || p.mediaUrls?.[0],
          mediaType: p.mediaType || (p.mediaUrls?.[0]?.endsWith('.mp4') ? 'video' : 'image'),
          analytics: {
            likes: p.likes || p.analytics?.likes || 0,
            comments: p.comments || p.analytics?.comments || 0,
            shares: p.shares || p.analytics?.shares || 0,
            impressions: p.impressions || p.analytics?.impressions || 0,
          },
          brandToneScore: p.brandToneScore || 95,
        }));
      }
      return [];
    } catch (err) {
      console.warn('[PostsAPI] Error fetching live posts:', err);
      return [];
    }
  },

  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    const targetPlatforms = payload.platforms.map((p) => (p === 'x' ? 'TWITTER' : p.toUpperCase()));
    const res = await http.post<{ success: boolean; data?: { draft?: any; post?: any } }>('/api/generation', {
      intent: 'ENGAGEMENT',
      platforms: targetPlatforms,
      topic: payload.content,
      customInstructions: `Scheduled for: ${payload.scheduledFor || 'immediate'}`,
    });

    const draft = res.data?.draft || res.data?.post;
    return {
      id: draft?.id || `post_${Date.now()}`,
      content: draft?.content || payload.content,
      platforms: payload.platforms,
      status: payload.status || 'SCHEDULED',
      scheduledFor: payload.scheduledFor || new Date().toISOString(),
      mediaUrl: payload.mediaUrl,
      mediaType: payload.mediaType,
      brandToneScore: 95,
    };
  },

  deletePost: async (postId: string): Promise<void> => {
    await http.delete(`/api/posts/${postId}`);
  },

  publishPost: async (postId: string): Promise<void> => {
    await http.post(`/api/posts/${postId}/publish`, {
      platforms: ['LINKEDIN', 'TWITTER'],
    });
  },

  generateCopy: async (topic: string, platform: SocialPlatform): Promise<string> => {
    const platName = platform === 'x' ? 'Twitter' : platform.toUpperCase();
    try {
      const res = await http.post<{ success: boolean; data?: { draft?: { content?: string } } }>('/api/generation', {
        intent: 'ENGAGEMENT',
        platforms: [platform === 'x' ? 'TWITTER' : platform.toUpperCase()],
        topic,
        customInstructions: `Tone: Authoritative and punchy for ${platName}. Include 2 relevant hashtags.`,
      });
      if (res.data?.draft?.content) {
        return res.data.draft.content;
      }
    } catch {
      // Fallback
    }
    return `⚡️ Strategic Insight: "${topic}" is accelerating adoption across modern teams.\n\n3 key takeaways:\n1. Automate repetitive workflows\n2. Maintain consistent brand guardrails\n3. Leverage predictive AI signals\n\nWhat are your thoughts? Drop a comment below!\n\n#Growth #${platform}`;
  },
};
