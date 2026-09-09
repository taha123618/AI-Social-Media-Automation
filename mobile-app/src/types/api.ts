export type SocialPlatform =
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'twitter'
  | 'tiktok'
  | 'youtube'
  | 'facebook';

export type PostStatus = 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'FAILED';

export interface PostAnalytics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
}

export interface Post {
  id: string;
  content: string;
  platforms: SocialPlatform[];
  status: PostStatus;
  scheduledFor: string;
  publishedAt?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  analytics?: PostAnalytics;
  brandToneScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostPayload {
  content: string;
  platforms: SocialPlatform[];
  status?: PostStatus;
  scheduledFor?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface CalendarSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  time: string; // e.g. "09:00 AM"
  platform: SocialPlatform;
  isPeakHour: boolean;
  engagementScore: number;
}

export type ConversationIntent = 'PRICING' | 'LEAD' | 'SUPPORT' | 'GENERAL';
export type ConversationStatus = 'PENDING' | 'AUTO_REPLIED' | 'RESOLVED';

export interface Conversation {
  id: string;
  senderName: string;
  senderAvatar: string;
  platform: SocialPlatform;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  intentTag: ConversationIntent;
  suggestedReply?: string;
  status: ConversationStatus;
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type PlanTier = 'Free' | 'Starter' | 'Pro' | 'Enterprise';

export interface Workspace {
  id: string;
  name: string;
  role: WorkspaceRole;
  planTier: PlanTier;
  avatarUrl?: string;
  slug?: string;
  memberCount?: number;
}

export interface AnalyticsOverview {
  totalImpressions: number;
  impressionsChange: number;
  engagementRate: number;
  engagementChange: number;
  totalLikes: number;
  likesChange: number;
  totalComments: number;
  commentsChange: number;
}

export interface PlanQuotas {
  postsUsed: number;
  postsTotal: number;
  articlesUsed: number;
  articlesTotal: number;
  storageUsedGb: number;
  storageTotalGb: number;
}

export interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface QuotaProgress {
  used: number;
  limit: number;
  label: string;
}

export interface AnalyticsQuotas {
  posts: QuotaProgress;
  articles: QuotaProgress;
  storage: QuotaProgress;
}

export interface AnalyticsData {
  followerVelocity: string;
  followerGrowthPercent: string;
  totalImpressions: string;
  impressionsGrowthPercent: string;
  avgEngagementRate: string;
  engagementGrowthPercent: string;
  attributedLeads: number;
  leadsGrowthPercent: string;
  quotas: AnalyticsQuotas;
  aiRecommendations: string[];
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  fullKey?: string;
  type: 'PRODUCTION' | 'SANDBOX';
  createdAt: string;
  lastUsedAt?: string;
}

export interface WebhookItem {
  id: string;
  url: string;
  eventTypes: string[];
  status: 'ACTIVE' | 'FAILING' | 'PAUSED';
  latencyMs: number;
  lastTriggeredAt: string;
}

export interface ApiKeysAndWebhooksResponse {
  apiKeys: ApiKeyItem[];
  webhooks: WebhookItem[];
  hmacSecret: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
  planTier: PlanTier;
}

export interface AuthResponse {
  user: UserSession;
  token: string;
  businessId?: string;
}
