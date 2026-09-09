import axios from 'axios';
import { sessionContext } from '@/lib/session-context';
import {
  AdCampaign,
  AnalyticsData,
  ApiKeyItem,
  ApiKeysAndWebhooksResponse,
  ArenaComparisonResult,
  BillingDetails,
  BlogArticle,
  CalendarSlot,
  CompetitorItem,
  ConnectedAccount,
  Conversation,
  CreatePostPayload,
  GeneratedImageResult,
  GeneratedVideoResult,
  KnowledgeProfile,
  LocationItem,
  MediaAsset,
  Post,
  ReviewItem,
  SocialMention,
  SocialPlatform,
  TeamMember,
  TrendEvent,
  WebhookItem,
  WorkflowDraft,
  Workspace,
} from '@/types/api';

/**
 * Single direct bridge to the Next.js SaaS backend (`app/api/*` routes).
 *
 * The mobile app has no separate mock layer — every request goes straight
 * to the backend with the auth + multi-tenant headers it expects.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/** Builds the Bearer token + x-business-id headers from app state. */
async function buildHeaders(tokenOverride?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = tokenOverride || sessionContext.getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const businessId = sessionContext.getWorkspaceId();
  if (businessId) {
    headers['x-business-id'] = businessId;
  }
  return headers;
}

const DAY_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const backendApi = {
  // ─────────────────────────── Auth ───────────────────────────

  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any; token?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; user?: any; token?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/login`,
      { email, password }
    );
    return res.data;
  },

  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any; token?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; user?: any; token?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/register`,
      { name, email, password }
    );
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { headers: await buildHeaders() });
    } catch {
      // Best-effort server-side invalidation
    }
  },

  getMe: async (token?: string): Promise<{ success: boolean; user?: any; error?: string }> => {
    const res = await axios.get<{ success?: boolean; user?: any; error?: string }>(`${API_BASE_URL}/api/auth/me`, {
      headers: await buildHeaders(token),
      timeout: 8000,
    });
    return {
      success: res.data.success ?? !!res.data.user,
      user: res.data.user,
      error: res.data.error,
    };
  },

  sendRegisterOtp: async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; message?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/register/send-otp`,
      { name, email, password }
    );
    return res.data;
  },

  verifyRegisterOtp: async (
    name: string,
    email: string,
    password: string,
    otp: string
  ): Promise<{ success: boolean; user?: any; token?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; user?: any; token?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/register/verify-otp`,
      { name, email, password, otp }
    );
    return res.data;
  },

  resendRegisterOtp: async (
    email: string,
    name?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; message?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/register/resend-otp`,
      { email, name }
    );
    return res.data;
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; message?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/forgot-password`,
      { email }
    );
    return res.data;
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; message?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/reset-password`,
      { token, newPassword }
    );
    return res.data;
  },

  getInvitation: async (
    token: string
  ): Promise<{ success: boolean; invitation?: any; error?: string }> => {
    const res = await axios.get<{ success: boolean; invitation?: any; error?: string }>(
      `${API_BASE_URL}/api/auth/invite?token=${token}`,
      { headers: await buildHeaders() }
    );
    return res.data;
  },

  acceptInvitation: async (
    token: string
  ): Promise<{ success: boolean; message?: string; businessId?: string; error?: string }> => {
    const res = await axios.post<{ success: boolean; message?: string; businessId?: string; error?: string }>(
      `${API_BASE_URL}/api/auth/invite`,
      { token },
      { headers: await buildHeaders() }
    );
    return res.data;
  },

  // ─────────────────────────── Posts & Composer ───────────────────────────

  getPosts: async (status?: string): Promise<Post[]> => {
    try {
      const queryParam = status && status !== 'ALL' ? `?status=${status}` : '';
      const res = await axios.get<{ success: boolean; data?: any; posts?: any[] }>(
        `${API_BASE_URL}/api/posts${queryParam}`,
        { headers: await buildHeaders() }
      );
      const rawList = res.data.posts || res.data.data?.posts || (Array.isArray(res.data.data) ? res.data.data : []);

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
      console.warn('[BackendAPI] Error fetching live posts:', err);
      return [];
    }
  },

  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    const targetPlatforms = payload.platforms.map((p) => (p === 'x' ? 'TWITTER' : p.toUpperCase()));
    const res = await axios.post<{ success: boolean; data?: { draft?: any; post?: any } }>(
      `${API_BASE_URL}/api/generation`,
      {
        intent: 'ENGAGEMENT',
        platforms: targetPlatforms,
        topic: payload.content,
        customInstructions: `Scheduled for: ${payload.scheduledFor || 'immediate'}`,
      },
      { headers: await buildHeaders() }
    );

    const draft = res.data.data?.draft || res.data.data?.post;
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
    await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, { headers: await buildHeaders() });
  },

  publishPost: async (postId: string): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/posts/${postId}/publish`,
      { platforms: ['LINKEDIN', 'TWITTER'] },
      { headers: await buildHeaders() }
    );
  },

  generateCopy: async (topic: string, platform: SocialPlatform): Promise<string> => {
    const platName = platform === 'x' ? 'Twitter' : platform.toUpperCase();
    const res = await axios.post<{ success: boolean; data?: { draft?: { content?: string } }; content?: string }>(
      `${API_BASE_URL}/api/generation`,
      {
        intent: 'ENGAGEMENT',
        platforms: [platform === 'x' ? 'TWITTER' : platform.toUpperCase()],
        topic,
        customInstructions: `Tone: Authoritative and punchy for ${platName}. Include 2 relevant hashtags.`,
      },
      { headers: await buildHeaders() }
    );
    const generated = res.data.data?.draft?.content || res.data.content;
    if (generated) {
      return generated;
    }
    throw new Error('AI Content Generation returned empty response from backend');
  },

  // ─────────────────────────── Calendar ───────────────────────────

  getCalendarSlots: async (): Promise<CalendarSlot[]> => {
    try {
      const res = await axios.get<{ slots?: any[]; data?: { slots?: any[] } }>(
        `${API_BASE_URL}/api/posting-schedule`,
        { headers: await buildHeaders() }
      );
      const slots = res.data.slots || res.data.data?.slots;

      if (slots && Array.isArray(slots)) {
        return slots.map((s: any) => {
          const dayNum = DAY_MAP[s.dayOfWeek] ?? 1;
          const hour12 = s.hour % 12 || 12;
          const ampm = s.hour >= 12 ? 'PM' : 'AM';
          const minuteStr = s.minute < 10 ? `0${s.minute}` : `${s.minute}`;
          const timeStr = `${hour12 < 10 ? '0' + hour12 : hour12}:${minuteStr} ${ampm}`;

          return {
            id: s.id,
            dayOfWeek: dayNum,
            time: timeStr,
            platform: 'linkedin' as SocialPlatform,
            isPeakHour: s.hour >= 8 && s.hour <= 10,
            engagementScore: s.hour >= 8 && s.hour <= 10 ? 94 : 85,
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('[BackendAPI] Failed to fetch live posting schedule:', err);
      return [];
    }
  },

  // ─────────────────────────── Inbox / DM automation ───────────────────────────

  getConversations: async (): Promise<Conversation[]> => {
    try {
      const res = await axios.get<{ rules?: any[]; data?: any }>(
        `${API_BASE_URL}/api/dm-automation/rules`,
        { headers: await buildHeaders() }
      );
      const rules = res.data.rules || res.data.data?.rules;

      if (rules && Array.isArray(rules)) {
        return rules.map((r: any, idx: number) => ({
          id: r.id || `dm_${idx}`,
          senderName: r.name || `Prospect ${idx + 1}`,
          senderAvatar: '',
          platform: (r.platform?.toLowerCase() || 'linkedin') as SocialPlatform,
          lastMessage: r.replyTemplate || r.triggerKeywords?.[0] || 'Inquiry about enterprise features',
          timestamp: `${idx * 15 + 2}m ago`,
          unreadCount: idx < 2 ? 1 : 0,
          intentTag: (r.actionType === 'LEAD_CAPTURE' ? 'LEAD' : idx % 2 === 0 ? 'PRICING' : 'SUPPORT') as any,
          suggestedReply: r.replyTemplate || 'Thanks for reaching out! Here is the complete breakdown.',
          status: 'PENDING' as const,
        }));
      }
      return [];
    } catch (err) {
      console.warn('[BackendAPI] Failed to fetch live conversations:', err);
      return [];
    }
  },

  sendReply: async (conversationId: string, replyText: string): Promise<void> => {
    const businessId = sessionContext.getWorkspaceId() || 'default';
    await axios.post(
      `${API_BASE_URL}/api/dm-automation/simulate`,
      {
        businessId,
        messageText: replyText,
        platform: 'INSTAGRAM',
        senderName: 'SocialAI Mobile Client',
      },
      { headers: await buildHeaders() }
    );
  },

  // ─────────────────────────── Analytics ───────────────────────────

  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      const [overviewRes, growthRes] = await Promise.allSettled([
        axios.get<any>(`${API_BASE_URL}/api/analytics/overview`, { headers: await buildHeaders() }),
        axios.get<any>(`${API_BASE_URL}/api/analytics/growth`, { headers: await buildHeaders() }),
      ]);

      const overviewData = overviewRes.status === 'fulfilled' ? overviewRes.value.data : null;
      const growthData = growthRes.status === 'fulfilled' ? growthRes.value.data : null;

      const ov = overviewData?.data || overviewData || {};
      const gr = growthData?.growth || growthData?.metrics || growthData || {};

      const totalImpressionsNum = ov.impressions ?? 0;
      const totalEngagementNum = (ov.likes ?? 0) + (ov.comments ?? 0) + (ov.shares ?? 0);
      const leadsCount = ov.leadCount ?? gr.leadsCaptured ?? 0;
      const postsPublished = ov.totalPosts ?? gr.postsPublished ?? 0;
      const impGrowthStr = ov.impressionsChange ?? '+0.0%';
      const engRateStr = ov.engagementRate ? `${ov.engagementRate}%` : totalImpressionsNum > 0 ? `${((totalEngagementNum / totalImpressionsNum) * 100).toFixed(1)}%` : '0.0%';
      const predictedGrowth = ov.predictedGrowth ?? '+0.0%';

      return {
        followerVelocity: `+${(postsPublished * 25).toLocaleString()}`,
        followerGrowthPercent: predictedGrowth,
        totalImpressions: totalImpressionsNum >= 1000 ? `${(totalImpressionsNum / 1000).toFixed(1)}K` : `${totalImpressionsNum}`,
        impressionsGrowthPercent: impGrowthStr,
        avgEngagementRate: engRateStr,
        engagementGrowthPercent: ov.commentsChange ?? '+0.0%',
        attributedLeads: leadsCount,
        leadsGrowthPercent: ov.leadCountChange ?? '+0.0%',
        quotas: {
          posts: { used: postsPublished, limit: 100, label: 'AI Social Posts' },
          articles: { used: Math.min(25, Math.floor(postsPublished / 3)), limit: 25, label: 'AI Blog Articles' },
          storage: { used: +(postsPublished * 0.08).toFixed(1), limit: 10, label: 'S3 Media Storage (GB)' },
        },
        aiRecommendations: [
          `Real-time AI performance score is tracking at ${ov.aiPerformanceScore || '88%'}.`,
          'Post scheduling between 08:00 AM - 10:00 AM matches peak audience activity.',
          'Brand Guardian compliance is active across all configured social channels.',
        ],
      };
    } catch (err) {
      console.warn('[BackendAPI] Failed to fetch live analytics:', err);
      return {
        followerVelocity: '+0',
        followerGrowthPercent: '+0.0%',
        totalImpressions: '0',
        impressionsGrowthPercent: '+0.0%',
        avgEngagementRate: '0.0%',
        engagementGrowthPercent: '+0.0%',
        attributedLeads: 0,
        leadsGrowthPercent: '+0.0%',
        quotas: {
          posts: { used: 0, limit: 100, label: 'AI Social Posts' },
          articles: { used: 0, limit: 25, label: 'AI Blog Articles' },
          storage: { used: 0, limit: 10, label: 'S3 Media Storage (GB)' },
        },
        aiRecommendations: [
          'Connect your social channels to begin receiving live audience analytics.',
        ],
      };
    }
  },

  // ─────────────────────────── AI Arena ───────────────────────────

  getArenaComparison: async (
    prompt: string,
    models = ['gpt-4o', 'claude-3-5-sonnet', 'deepseek-r1', 'gemini-2-0-flash']
  ): Promise<ArenaComparisonResult> => {
    const res = await axios.post<{
      success: boolean;
      comparison?: any;
      data?: any;
    }>(
      `${API_BASE_URL}/api/ai-arena/compare`,
      { prompt, models },
      { headers: await buildHeaders() }
    );

    const comp = res.data.comparison || res.data.data || res.data;
    const list = comp.results || [];
    const formattedResults = list.map((item: any) => ({
      modelId: item.modelId || item.model,
      name: item.modelName || item.name || item.modelId,
      provider: item.provider || 'AI Provider',
      output: item.output || item.content || '',
      latencyMs: item.latencyMs || 0,
      tokenCount: item.totalTokens || item.tokenCount || 0,
      estimatedCost: item.estimatedCostUsd ? `$${Number(item.estimatedCostUsd).toFixed(4)}` : '$0.00',
      qualityScore: item.qualityScore || 90,
    }));

    return {
      prompt,
      intent: 'COMPARE',
      results: formattedResults,
      recommendedModelId: comp.recommendedModelId || formattedResults[0]?.modelId || 'gpt-4o',
    };
  },

  // ─────────────────────────── Competitors ───────────────────────────

  getCompetitorInsights: async (domain: string): Promise<CompetitorItem[]> => {
    const res = await axios.post<{ success: boolean; data?: any; competitors?: any[] }>(
      `${API_BASE_URL}/api/competitor/scan`,
      { domain },
      { headers: await buildHeaders() }
    );
    const dataObj = res.data.data || res.data;
    const list = dataObj.competitors || res.data.competitors || (Array.isArray(dataObj) ? dataObj : []);
    if (Array.isArray(list)) {
      return list.map((c: any) => ({
        id: c.id || `comp_${Math.random()}`,
        domain: c.domain || domain,
        name: c.name || domain.split('.')[0],
        estimatedTraffic: c.estimatedTraffic || c.estimatedGrowth || `${c.estimatedPopularity || 80}% reach`,
        topKeywords: c.topKeywords || [c.contentStyle || 'Social growth'],
        strengths: c.strengths || [],
        weaknesses: c.weaknesses || [],
        marketSharePercent: c.marketSharePercent || c.estimatedPopularity || 20,
        lastScannedAt: new Date().toISOString(),
      }));
    }
    return [];
  },

  // ─────────────────────────── Blog Articles ───────────────────────────

  getBlogArticles: async (): Promise<BlogArticle[]> => {
    const res = await axios.get<{ success?: boolean; articles?: any[]; data?: any }>(
      `${API_BASE_URL}/api/blog/articles`,
      { headers: await buildHeaders() }
    );
    const list = res.data.data || res.data.articles || (Array.isArray(res.data) ? res.data : []);
    if (Array.isArray(list)) {
      return list.map((a: any) => ({
        id: a.id,
        title: a.title || 'Untitled Article',
        slug: a.slug || 'untitled',
        excerpt: a.excerpt || a.metaDescription || '',
        content: a.content || '',
        status: a.status || 'DRAFT',
        seoScore: a.seoScore || 85,
        wordCount: a.wordCount || a.wordCountTarget || 1000,
        targetKeyword: a.targetKeyword || 'AI Automation',
        publishedAt: a.publishedAt,
        createdAt: a.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  },

  // ─────────────────────────── Ad Campaigns ───────────────────────────

  getAdCampaigns: async (): Promise<AdCampaign[]> => {
    const res = await axios.get<{ success?: boolean; campaigns?: any[]; data?: any; stats?: any }>(
      `${API_BASE_URL}/api/ad-campaigns`,
      { headers: await buildHeaders() }
    );
    const list = res.data.campaigns || res.data.data?.campaigns || (Array.isArray(res.data.data) ? res.data.data : []);
    if (Array.isArray(list)) {
      return list.map((c: any) => ({
        id: c.id,
        name: c.name || 'Ad Campaign',
        platform: c.platform || 'META',
        status: c.status || 'ACTIVE',
        dailyBudget: c.dailyBudget || 0,
        spent: c.spent || 0,
        roas: c.roas || res.data.stats?.avgRoas || 0,
        impressions: c.impressions || 0,
        clicks: c.clicks || 0,
        conversions: c.conversions || 0,
        variantsCount: c.adSets?.reduce((sum: number, set: any) => sum + (set.ads?.length || 0), 0) || c.variantsCount || 1,
      }));
    }
    return [];
  },

  // ─────────────────────────── Social Listening Radar ───────────────────────────

  getSocialListeningRadar: async (): Promise<SocialMention[]> => {
    const businessId = sessionContext.getWorkspaceId();
    const queryParam = businessId ? `?businessId=${businessId}` : '';
    const res = await axios.get<{ success?: boolean; report?: any; data?: any; mentions?: any[] }>(
      `${API_BASE_URL}/api/social-listening/radar${queryParam}`,
      { headers: await buildHeaders() }
    );
    const report = res.data.report || res.data.data || res.data;
    const list = report?.mentions || report?.recentMentions || res.data.mentions || (Array.isArray(report) ? report : []);
    if (Array.isArray(list)) {
      return list.map((m: any) => ({
        id: m.id || `mention_${Math.random()}`,
        author: m.author || m.source || 'Audience Member',
        platform: (m.platform?.toLowerCase() || 'x') as SocialPlatform,
        content: m.content || m.snippet || m.text || '',
        sentiment: m.sentiment || 'POSITIVE',
        sentimentScore: m.sentimentScore || (m.sentiment === 'POSITIVE' ? 90 : m.sentiment === 'NEGATIVE' ? 30 : 60),
        reach: m.reach || m.followersCount || 1000,
        timestamp: m.timestamp || m.createdAt || 'Recent',
        engagement: m.engagement || (m.likes || 0) + (m.comments || 0),
      }));
    }
    return [];
  },

  // ─────────────────────────── Reviews Booster ───────────────────────────

  getReviews: async (): Promise<ReviewItem[]> => {
    const businessId = sessionContext.getWorkspaceId();
    const queryParam = businessId ? `?businessId=${businessId}` : '';
    const res = await axios.get<{ success?: boolean; data?: { reviews?: any[] }; reviews?: any[] }>(
      `${API_BASE_URL}/api/reviews${queryParam}`,
      { headers: await buildHeaders() }
    );
    const list = res.data.data?.reviews || res.data.reviews || (Array.isArray(res.data.data) ? res.data.data : []);
    if (Array.isArray(list)) {
      return list.map((r: any) => ({
        id: r.id,
        author: r.author || r.customerName || r.reviewerName || 'Customer',
        rating: r.rating || 5,
        source: r.source || r.platform || 'GOOGLE',
        comment: r.comment || r.reviewText || r.content || '',
        timestamp: r.timestamp || r.reviewDate || r.createdAt || 'Recent',
        replyStatus: (r.responseText || r.replyText) ? 'REPLIED' : 'PENDING',
        replyText: r.responseText || r.replyText,
      }));
    }
    return [];
  },

  requestReview: async (customerName: string, contact: string, channel = 'SMS'): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/reviews/request`,
      { customerName, contact, channel },
      { headers: await buildHeaders() }
    );
  },

  // ─────────────────────────── Multi-Location ───────────────────────────

  getLocations: async (): Promise<LocationItem[]> => {
    const businessId = sessionContext.getWorkspaceId();
    const queryParam = businessId ? `?businessId=${businessId}` : '';
    const res = await axios.get<{ success?: boolean; locations?: any[]; data?: any }>(
      `${API_BASE_URL}/api/multi-location${queryParam}`,
      { headers: await buildHeaders() }
    );
    const list = res.data.locations || res.data.data?.locations || (Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    if (Array.isArray(list)) {
      return list.map((l: any) => ({
        id: l.id,
        name: l.name || 'Location Branch',
        address: l.address || '',
        city: l.city || '',
        state: l.state || '',
        activeCampaigns: l.activeCampaigns || 0,
        localEngagementRate: l.localEngagementRate || '0.0%',
        isSynced: l.isSynced ?? true,
      }));
    }
    return [];
  },

  // ─────────────────────────── Knowledge Base ───────────────────────────

  getKnowledgeProfile: async (): Promise<KnowledgeProfile> => {
    const res = await axios.get<{ profile?: any; data?: any; brandVoice?: string }>(
      `${API_BASE_URL}/api/knowledge/profile`,
      { headers: await buildHeaders() }
    );
    const p = res.data.profile || res.data.data?.profile || res.data.data || res.data || {};
    return {
      brandVoice: p.brandVoice || 'Custom brand voice and tone profile.',
      targetAudience: p.targetAudience || 'Target audience and demographic definition.',
      industry: p.industry || 'Business Industry',
      keyProducts: Array.isArray(p.keyProducts) ? p.keyProducts : p.keyProducts ? [p.keyProducts] : [],
      documentsCount: p.documentsCount ?? p.documents?.length ?? 0,
      lastTrainedAt: p.lastTrainedAt || p.updatedAt || 'Up to date',
    };
  },

  // ─────────────────────────── Viral Trends ───────────────────────────

  getTrendEvents: async (city?: string): Promise<TrendEvent[]> => {
    const res = await axios.post<{ success?: boolean; data?: any }>(
      `${API_BASE_URL}/api/trends/events`,
      { location: { city: city || 'San Francisco' } },
      { headers: await buildHeaders() }
    );
    const dataObj = res.data.data || res.data;
    const list = dataObj?.opportunities || (Array.isArray(dataObj) ? dataObj : []);
    if (Array.isArray(list)) {
      return list.map((t: any, idx: number) => ({
        id: t.id || `trend_${idx}_${Date.now()}`,
        title: t.title || 'Market Opportunity',
        category: t.type || 'Seasonal & Trend',
        velocityScore: t.velocityScore || 90,
        suggestedHook: t.socialPostDraft?.caption || t.strategy || t.recommendedOffer?.title || '',
        relevanceScore: 95,
        peakWindow: t.peakWindow || 'Active Now',
      }));
    }
    return [];
  },

  // ─────────────────────────── Connected Social Accounts ───────────────────────────

  getConnectedAccounts: async (): Promise<ConnectedAccount[]> => {
    const res = await axios.get<any[]>(
      `${API_BASE_URL}/api/social/accounts`,
      { headers: await buildHeaders() }
    );
    const list = Array.isArray(res.data) ? res.data : (res.data as any)?.accounts || [];
    return list.map((a: any) => ({
      id: a.id,
      platform: (a.platform?.toLowerCase() || 'linkedin') as SocialPlatform,
      username: a.platformId || a.name || '@social',
      displayName: a.name || a.platform || 'Social Account',
      avatarUrl: a.avatar,
      followersCount: a.followersCount || 0,
      isConnected: Boolean(a.accessToken || !a.isExpired),
      tokenExpiresAt: a.tokenExpiresAt ? new Date(a.tokenExpiresAt).toLocaleDateString() : undefined,
    }));
  },

  // ─────────────────────────── Team Members ───────────────────────────

  getTeamMembers: async (): Promise<TeamMember[]> => {
    const res = await axios.get<{ members?: any[]; data?: any }>(
      `${API_BASE_URL}/api/team`,
      { headers: await buildHeaders() }
    );
    const list = res.data.members || res.data.data?.members || (Array.isArray(res.data.data) ? res.data.data : []);
    if (Array.isArray(list)) {
      return list.map((m: any) => ({
        id: m.id,
        name: m.user?.name || m.name || 'Team Member',
        email: m.user?.email || m.email || '',
        role: m.role || 'EDITOR',
        avatarUrl: m.user?.image || m.avatarUrl,
        joinedAt: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Active Member',
      }));
    }
    return [];
  },

  inviteTeamMember: async (email: string, role: string): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/team`,
      { email, role },
      { headers: await buildHeaders() }
    );
  },

  // ─────────────────────────── Billing & Usage ───────────────────────────

  getBillingDetails: async (): Promise<BillingDetails> => {
    const businessId = sessionContext.getWorkspaceId();
    const queryParam = businessId ? `?businessId=${businessId}` : '';
    const res = await axios.get<{ success?: boolean; usage?: any; data?: any }>(
      `${API_BASE_URL}/api/billing/usage${queryParam}`,
      { headers: await buildHeaders() }
    );
    const u = res.data.usage || res.data.data?.usage || {};
    return {
      planTier: u.planTier || 'Pro',
      amount: u.amount || 0,
      interval: u.interval || 'monthly',
      renewsAt: u.renewsAt || 'End of billing cycle',
      paymentMethodMasked: u.paymentMethodMasked || 'Active Subscription',
      usage: {
        postsUsed: u.ai_posts?.current || u.postsUsed || 0,
        postsLimit: u.ai_posts?.limit || u.postsLimit || 100,
        aiTokensUsed: u.ai_tokens?.current || u.aiTokensUsed || 0,
        aiTokensLimit: u.ai_tokens?.limit || u.aiTokensLimit || 1000000,
        storageGbUsed: u.storage_gb?.current || u.storageGbUsed || 0,
        storageGbLimit: u.storage_gb?.limit || u.storageGbLimit || 10,
      },
    };
  },

  // ─────────────────────────── Settings: API Keys & Webhooks ───────────────────────────

  getApiKeysAndWebhooks: async (): Promise<ApiKeysAndWebhooksResponse> => {
    const [keysRes, hooksRes] = await Promise.allSettled([
      axios.get<any>(`${API_BASE_URL}/api/settings/api-keys`, { headers: await buildHeaders() }),
      axios.get<any>(`${API_BASE_URL}/api/settings/webhooks`, { headers: await buildHeaders() }),
    ]);

    const keysData = keysRes.status === 'fulfilled' ? keysRes.value.data : null;
    const hooksData = hooksRes.status === 'fulfilled' ? hooksRes.value.data : null;

    const rawKeys = keysData?.keys || (Array.isArray(keysData) ? keysData : []);
    const rawWebhooks = hooksData?.webhooks || (Array.isArray(hooksData) ? hooksData : []);

    const apiKeys: ApiKeyItem[] = rawKeys.map((k: any) => ({
      id: k.id,
      name: k.name || 'API Key',
      keyMasked: k.key ? `${k.key.slice(0, 8)}••••••••••••${k.key.slice(-4)}` : 'sai_live_••••••••••••',
      fullKey: k.key || k.fullKey,
      type: (k.type || (k.name?.toLowerCase().includes('sandbox') ? 'SANDBOX' : 'PRODUCTION')) as 'PRODUCTION' | 'SANDBOX',
      createdAt: k.createdAt || new Date().toISOString(),
      lastUsedAt: k.lastUsedAt || 'Recently',
    }));

    const webhooks: WebhookItem[] = rawWebhooks.map((w: any) => ({
      id: w.id,
      url: w.url,
      eventTypes: w.events || w.eventTypes || ['post.published'],
      status: (w.isActive ?? true) ? 'ACTIVE' : 'PAUSED',
      latencyMs: w.latencyMs || 120,
      lastTriggeredAt: w.lastTriggeredAt || 'Never',
    }));

    return {
      apiKeys,
      webhooks,
      hmacSecret: keysData?.hmacSecret || hooksData?.hmacSecret || '',
    };
  },

  // ─────────────────────────── Workspaces ───────────────────────────

  getWorkspaces: async (): Promise<Workspace[]> => {
    const res = await axios.get<{ success: boolean; data?: Workspace[]; workspaces?: Workspace[] }>(
      `${API_BASE_URL}/api/workspaces`,
      { headers: await buildHeaders() }
    );
    const list = res.data.data || res.data.workspaces;
    if (Array.isArray(list)) {
      return list;
    }
    return [];
  },

  createWorkspace: async (name: string, planTier = 'Pro'): Promise<Workspace> => {
    const res = await axios.post<{ success: boolean; data: Workspace }>(
      `${API_BASE_URL}/api/workspaces`,
      { name, planTier },
      { headers: await buildHeaders() }
    );
    if (res.data.data) {
      return res.data.data;
    }
    throw new Error('Failed to create workspace on server');
  },

  // ─────────────────────────── Image Generation Studio ───────────────────────────

  generateImage: async (
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:5' = '1:1',
    style = 'Photorealistic'
  ): Promise<GeneratedImageResult> => {
    const res = await axios.post<{ success: boolean; data?: any; imageUrl?: string; id?: string; url?: string }>(
      `${API_BASE_URL}/api/image/generate`,
      { prompt, aspectRatio, style },
      { headers: await buildHeaders() }
    );
    const data = res.data.data || res.data;
    return {
      id: data.id || `img_${Date.now()}`,
      imageUrl: data.imageUrl || data.url || '',
      prompt,
      aspectRatio,
      style,
      createdAt: new Date().toISOString(),
    };
  },

  // ─────────────────────────── Video Storyboard Studio ───────────────────────────

  generateVideoStoryboard: async (
    title: string,
    concept: string,
    voiceStyle = 'Professional Narrator'
  ): Promise<GeneratedVideoResult> => {
    const res = await axios.post<{ success: boolean; data?: any; result?: any }>(
      `${API_BASE_URL}/api/video/rag-generate`,
      { title, prompt: concept, voice: voiceStyle },
      { headers: await buildHeaders() }
    );
    const d = res.data.data || res.data.result || res.data;
    const scenes = (d.scenes || []).map((s: any, idx: number) => ({
      sceneNumber: idx + 1,
      title: s.title || `Scene ${idx + 1}`,
      script: s.script || s.narrative || '',
      visualPrompt: s.visualPrompt || s.visual || '',
      durationSeconds: s.durationSeconds || 5,
    }));

    return {
      id: d.id || `vid_${Date.now()}`,
      title: d.title || title,
      concept,
      totalDurationSeconds: scenes.reduce((acc: number, sc: any) => acc + sc.durationSeconds, 0) || 15,
      voiceStyle,
      scenes,
      videoUrl: d.videoUrl,
      status: 'READY',
      createdAt: new Date().toISOString(),
    };
  },

  // ─────────────────────────── Media Gallery ───────────────────────────

  getMediaAssets: async (): Promise<MediaAsset[]> => {
    try {
      const res = await axios.get<any[]>(`${API_BASE_URL}/api/gallery/images`, {
        headers: await buildHeaders(),
      });
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map((item) => ({
        id: item.id || `med_${Date.now()}`,
        url: item.url || item.imageUrl || '',
        type: (item.format === 'mp4' ? 'video' : 'image') as 'image' | 'video',
        aspectRatio: item.aspectRatio || '1:1',
        filename: item.title || item.prompt || 'Generated Asset',
        sizeBytes: item.size || 0,
        createdAt: item.createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('[BackendAPI] Failed to fetch live gallery images:', err);
      return [];
    }
  },

  // ─────────────────────────── Approval Workflows ───────────────────────────

  getWorkflows: async (status = 'PENDING_REVIEW'): Promise<WorkflowDraft[]> => {
    try {
      const res = await axios.get<{ drafts?: any[]; data?: any }>(
        `${API_BASE_URL}/api/workflows?status=${status}`,
        { headers: await buildHeaders() }
      );
      const list = res.data.drafts || res.data.data?.drafts || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(list)) {
        return list.map((d: any) => ({
          id: d.id,
          title: d.title || d.topic || 'Untitled Workflow Draft',
          author: d.creator?.name || d.creator?.email || 'Autonomous AI Agent',
          step: d.status === 'PENDING_REVIEW' ? 'Pending Human Approval' : d.status,
          platforms: d.platforms || ['LinkedIn', 'Twitter'],
          riskScore: 'Low (98% Tone Score)',
          status: d.status || 'PENDING_REVIEW',
          content: d.content,
          createdAt: d.createdAt || new Date().toISOString(),
        }));
      }
      return [];
    } catch (err) {
      console.warn('[BackendAPI] Failed to fetch live approval workflows:', err);
      return [];
    }
  },

  approveWorkflowDraft: async (draftId: string, comment?: string): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/workflows?draftId=${draftId}`,
      { action: 'approve', comment },
      { headers: await buildHeaders() }
    );
  },

  rejectWorkflowDraft: async (draftId: string, comment?: string): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/workflows?draftId=${draftId}`,
      { action: 'reject', comment },
      { headers: await buildHeaders() }
    );
  },

  createApiKey: async (name: string, permissions: string[] = ['*']): Promise<ApiKeyItem> => {
    const res = await axios.post<any>(
      `${API_BASE_URL}/api/settings/api-keys`,
      { name, permissions },
      { headers: await buildHeaders() }
    );
    const k = res.data;
    return {
      id: k.id,
      name: k.name || name,
      keyMasked: k.key ? `${k.key.slice(0, 8)}••••••••••••${k.key.slice(-4)}` : 'sai_live_••••••••••••',
      fullKey: k.key,
      type: 'PRODUCTION',
      createdAt: k.createdAt || new Date().toISOString(),
    };
  },

  createWebhook: async (name: string, url: string, events: string[] = ['post.published']): Promise<WebhookItem> => {
    const res = await axios.post<any>(
      `${API_BASE_URL}/api/settings/webhooks`,
      { name, url, events },
      { headers: await buildHeaders() }
    );
    const w = res.data;
    return {
      id: w.id,
      url: w.url || url,
      eventTypes: w.events || events,
      status: 'ACTIVE',
      latencyMs: 50,
      lastTriggeredAt: 'Just created',
    };
  },
};