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

// ─────────────────────────── AI Arena ───────────────────────────
export interface ArenaModelResponse {
  modelId: string;
  name: string;
  provider: string;
  output: string;
  latencyMs: number;
  tokenCount: number;
  estimatedCost: string;
  qualityScore: number;
}

export interface ArenaComparisonResult {
  prompt: string;
  intent: string;
  results: ArenaModelResponse[];
  recommendedModelId: string;
}

// ─────────────────────────── Competitor Intelligence ───────────────────────────
export interface CompetitorItem {
  id: string;
  domain: string;
  name: string;
  logoUrl?: string;
  estimatedTraffic: string;
  topKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  marketSharePercent: number;
  lastScannedAt: string;
}

// ─────────────────────────── Blog Articles ───────────────────────────
export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  seoScore: number;
  wordCount: number;
  targetKeyword: string;
  publishedAt?: string;
  createdAt: string;
}

// ─────────────────────────── Ad Campaigns ───────────────────────────
export interface AdCampaign {
  id: string;
  name: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN';
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  dailyBudget: number;
  spent: number;
  roas: number;
  impressions: number;
  clicks: number;
  conversions: number;
  variantsCount: number;
}

// ─────────────────────────── Social Listening Radar ───────────────────────────
export interface SocialMention {
  id: string;
  author: string;
  platform: SocialPlatform;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore: number;
  reach: number;
  timestamp: string;
  engagement: number;
}

// ─────────────────────────── Reviews Booster ───────────────────────────
export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  source: 'GOOGLE' | 'TRUSTPILOT' | 'YELP' | 'FACEBOOK';
  comment: string;
  timestamp: string;
  replyStatus: 'PENDING' | 'REPLIED' | 'DISMISSED';
  replyText?: string;
}

// ─────────────────────────── Multi-Location ───────────────────────────
export interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  activeCampaigns: number;
  localEngagementRate: string;
  isSynced: boolean;
}

// ─────────────────────────── Knowledge Base ───────────────────────────
export interface KnowledgeProfile {
  brandVoice: string;
  targetAudience: string;
  industry: string;
  keyProducts: string[];
  documentsCount: number;
  lastTrainedAt: string;
}

// ─────────────────────────── Viral Trends & Events ───────────────────────────
export interface TrendEvent {
  id: string;
  title: string;
  category: string;
  velocityScore: number;
  suggestedHook: string;
  relevanceScore: number;
  peakWindow: string;
}

// ─────────────────────────── Connected Social Accounts ───────────────────────────
export interface ConnectedAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  displayName: string;
  avatarUrl?: string;
  followersCount: number;
  isConnected: boolean;
  tokenExpiresAt?: string;
}

// ─────────────────────────── Team Members ───────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatarUrl?: string;
  joinedAt: string;
}

// ─────────────────────────── Billing & Subscriptions ───────────────────────────
export interface BillingDetails {
  planTier: PlanTier;
  amount: number;
  interval: 'monthly' | 'yearly';
  renewsAt: string;
  paymentMethodMasked: string;
  usage: {
    postsUsed: number;
    postsLimit: number;
    aiTokensUsed: number;
    aiTokensLimit: number;
    storageGbUsed: number;
    storageGbLimit: number;
  };
}

// ─────────────────────────── Media Gallery Asset ───────────────────────────
export interface MediaAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  aspectRatio: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

// ─────────────────────────── Image & Video Generation ───────────────────────────
export interface GeneratedImageResult {
  id: string;
  imageUrl: string;
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5';
  style: string;
  seed?: number;
  createdAt: string;
}

export interface GeneratedVideoScene {
  sceneNumber: number;
  title: string;
  script: string;
  visualPrompt: string;
  durationSeconds: number;
}

export interface GeneratedVideoResult {
  id: string;
  title: string;
  concept: string;
  totalDurationSeconds: number;
  voiceStyle: string;
  scenes: GeneratedVideoScene[];
  videoUrl?: string;
  status: 'GENERATING' | 'READY' | 'FAILED';
  createdAt: string;
}

// ─────────────────────────── Review & Approval Workflows ───────────────────────────
export interface WorkflowDraft {
  id: string;
  title: string;
  author: string;
  step: string;
  platforms: string[];
  riskScore: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'PUBLISHED';
  content?: string;
  createdAt: string;
}

