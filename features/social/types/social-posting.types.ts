/**
 * Social Media Posting - Complete TypeScript Types & Interfaces
 * Covers all aspects of the post creation, publishing, and analytics workflow
 */

import { Platform, ContentStatus, ContentIntent } from '@/app/generated/prisma/client';

// Social Media Platforms supported by this feature
export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
}

// ============================================================================
// Post Creation & Draft Management
// ============================================================================

export interface CreatePostDraftRequest {
  title?: string;
  platforms: SocialPlatform[];
  socialAccountIds: string[];
  contentJson: PostContent;
  mediaUrls?: string[];
  status?: ContentStatus;
  intent?: ContentIntent;
  customPrompt?: string;
  scheduledFor?: Date;
}

export interface PostContent {
  text?: string;
  caption?: string;
  firstComment?: string;
  hashtags?: string[];
  mentions?: string[];
  callToAction?: string;
  link?: string;
  description?: string;
}

export interface PostDraftResponse {
  id: string;
  title?: string;
  content: PostContent;
  platforms: SocialPlatform[];
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  postedAt?: Date;
}

export interface UpdatePostDraftRequest {
  contentJson?: PostContent;
  mediaUrls?: string[];
  scheduledFor?: Date;
  platforms?: SocialPlatform[];
  status?: ContentStatus;
}

// ============================================================================
// Post Publishing
// ============================================================================

export interface PublishPostRequest {
  draftId: string;
  socialAccountIds?: string[];
  publishImmediately?: boolean;
  scheduledFor?: Date;
  postType?: PostType;
}

export interface PublishPostResponse {
  success: boolean;
  postIds: string[];
  externalPostIds: Record<string, string>; // socialAccountId -> platformPostId
  publishedUrls: string[];
  status: 'PUBLISHED' | 'SCHEDULED';
  publishedAt?: Date;
  scheduledFor?: Date;
}

export interface SchedulePostRequest {
  draftId: string;
  scheduledFor: Date;
  timezone?: string;
  socialAccountIds?: string[];
}

export interface SchedulePostResponse {
  success: boolean;
  scheduledFor: Date;
  postIds: string[];
}

// ============================================================================
// Post Types
// ============================================================================

export enum PostType {
  STANDARD_POST = 'STANDARD_POST',
  CAROUSEL = 'CAROUSEL',
  VIDEO = 'VIDEO',
  REEL = 'REEL',
  REELS = 'REELS',
  STORY = 'STORY',
  IGTV = 'IGTV',
  LIVE = 'LIVE',
  COLLECTION = 'COLLECTION',
}

export interface PostTypeConfig {
  platform: Platform;
  type: PostType;
  maxLength: number;
  maxImages: number;
  maxVideos: number;
  videoMaxDuration: number;
  imageRatios: string[];
  supportsHashtags: boolean;
  supportsMentions: boolean;
  supportsLinks: boolean;
}

// ============================================================================
// Listing & Filtering
// ============================================================================

export interface ListPostsQuery {
  skip?: number;
  take?: number;
  status?: ContentStatus | ContentStatus[];
  platform?: SocialPlatform | SocialPlatform[];
  sortBy?: 'date' | 'engagement' | 'reach' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface PostListItem {
  id: string;
  title?: string;
  content: string;
  fullContent?: string;
  firstComment?: string;
  platforms: SocialPlatform[];
  status: ContentStatus;
  postedAt?: Date;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
  mediaUrls?: string[];
  accounts: {
    id: string;
    name: string;
    avatar?: string;
    platform: Platform;
  }[];
  // Direct analytics fields from Prisma model
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  shares: number;
  saves: number;
  videoViews: number;
  videoCompletionRate?: number;
  reelWatchTime: number;
  profileVisits: number;
  websiteClicks: number;
  bookingClicks: number;
  phoneClicks: number;
  messageClicks: number;
  directionRequests: number;
  storyExits: number;
  storyTaps: number;
  // Optional nested analytics for backward compatibility
  analytics?: PostQuickAnalytics;
  intent?: ContentIntent;
  contentJson?: any;
}

export interface PostQuickAnalytics {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  saves?: number;
  profileVisits?: number;
  reelWatchTime?: number;
  storyExits?: number;
  storyTaps?: number;
}

export interface ListPostsResponse {
  posts: PostListItem[];
  total: number;
  skip: number;
  take: number;
}

// ============================================================================
// Analytics & Metrics
// ============================================================================

export interface PostAnalyticsRequest {
  postId: string;
  includeHistory?: boolean;
  days?: number;
}

export interface PostAnalyticsResponse {
  postId: string;
  platform: Platform;
  externalPostId?: string;
  publishedAt: Date;
  metrics: PostMetrics;
  historicalData?: MetricsSnapshot[];
  recommendations?: string[];
}

export interface PostMetrics {
  engagement: EngagementMetrics;
  reach: ReachMetrics;
  video?: VideoMetrics;
  story?: StoryMetrics;
  click?: ClickMetrics;
  timestamps?: {
    firstEngagement: Date;
    lastUpdate: Date;
  };
}

export interface EngagementMetrics {
  likes: number;
  linesChange?: number;
  comments: number;
  commentsChange?: number;
  shares: number;
  sharesChange?: number;
  saves: number;
  savesChange?: number;
  engagementRate: number;
  engagementRateChange?: number;
}

export interface ReachMetrics {
  impressions: number;
  impressionsChange?: number;
  reach: number;
  reachChange?: number;
  profileVisits?: number;
  profileVisitsChange?: number;
  follows?: number;
  followsChange?: number;
}

export interface VideoMetrics {
  views: number;
  viewsChange?: number;
  completionRate: number;
  averageWatchTime: string;
  watchTime: number;
  replays?: number;
}

export interface StoryMetrics {
  impressions: number;
  replies: number;
  exits: number;
  navigateAway: number;
  navigateToProfile: number;
  taps: number;
  shares: number;
}

export interface ClickMetrics {
  linkClicks: number;
  websiteClicks: number;
  bookingClicks?: number;
  callClicks?: number;
  messageClicks?: number;
  directionClicks?: number;
  phoneClicks?: number;
}

export interface MetricsSnapshot {
  timestamp: Date;
  metrics: Partial<PostMetrics>;
}

// ============================================================================
// Media Management
// ============================================================================

export interface PostMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'GIF';
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number; // for videos
  size?: number;
  altText?: string;
}

export interface UploadMediaRequest {
  file: File;
  type: 'IMAGE' | 'VIDEO' | 'GIF';
  altText?: string;
}

export interface UploadMediaResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: string;
  size: number;
}

// ============================================================================
// Social Accounts
// ============================================================================

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  name: string;
  avatar?: string;
  profileUrl?: string;
  platformId: string;
  isActive: boolean;
  tokenExpiresAt?: Date;
  lastSync?: Date;
  metrics?: AccountMetrics;
}

export interface AccountMetrics {
  followers: number;
  following?: number;
  engagement: number;
  posts: number;
  lastUpdated: Date;
}

export interface ConnectAccountRequest {
  platform: Platform;
  code?: string;
  accessToken?: string;
}

export interface ConnectAccountResponse {
  success: boolean;
  account: ConnectedAccount;
  message: string;
}

// ============================================================================
// Queue & Scheduling
// ============================================================================

export enum PublishingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

export interface PostPublishingQueueItem {
  id: string;
  postId: string;
  platform: Platform;
  socialAccountId: string;
  status: PublishingStatus;
  scheduledFor?: Date;
  attempts: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueStatusResponse {
  total: number;
  pending: number;
  processing: number;
  succeeded: number;
  failed: number;
  items: PostPublishingQueueItem[];
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchPublishRequest {
  draftIds: string[];
  publishImmediately?: boolean;
  scheduledFor?: Date;
}

export interface BatchPublishResponse {
  success: boolean;
  results: {
    draftId: string;
    postId: string;
    success: boolean;
    error?: string;
  }[];
  totalSucceeded: number;
  totalFailed: number;
}

export interface BatchDeleteRequest {
  postIds: string[];
}

export interface BatchDeleteResponse {
  success: boolean;
  deletedCount: number;
  errors: {
    postId: string;
    error: string;
  }[];
}

// ============================================================================
// Insights & Recommendations
// ============================================================================

export interface PostInsights {
  postId: string;
  bestTimeToPost?: string;
  recommendedPlatforms?: SocialPlatform[];
  contentAnalysis: ContentAnalysis;
  performance: PerformanceAnalysis;
  suggestions: PostSuggestion[];
}

export interface ContentAnalysis {
  sentimentScore: number; // -1 to 1
  readability: number; // 0-100
  engagement_potential: number; // 0-100
  hashtagCount: number;
  mentionCount: number;
  linkCount: number;
  characterCount: number;
  issues: string[];
}

export interface PerformanceAnalysis {
  performanceScore: number; // 0-100
  comparison: 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
  predictedEngagement: number;
  predictedReach: number;
  similarContent: {
    postId: string;
    similarity: number;
    metrics: PostQuickAnalytics;
  }[];
}

export interface PostSuggestion {
  type: 'HASHTAG' | 'TIMING' | 'FORMAT' | 'CONTENT' | 'PLATFORM';
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action?: string;
}

// ============================================================================
// AI Content Generation
// ============================================================================

export interface GenerateContentRequest {
  prompt: string;
  platforms: SocialPlatform[];
  tone: ContentTone;
  intent: ContentIntent;
  characterLimit?: number;
  includeHashtags?: boolean;
  includeCTA?: boolean;
  businessContext?: string;
  targetAudience?: string;
}

export enum ContentTone {
  PROFESSIONAL = 'PROFESSIONAL',
  CASUAL = 'CASUAL',
  PLAYFUL = 'PLAYFUL',
  INSPIRATIONAL = 'INSPIRATIONAL',
  COMEDIC = 'COMEDIC',
  INFORMATIVE = 'INFORMATIVE',
  URGENT = 'URGENT',
  HEARTFELT = 'HEARTFELT',
}

export interface GenerateContentResponse {
  content: PostContent;
  variants: PostContent[];
  recommendations: {
    platform: Platform;
    adjustments: string[];
    bestHashtags: string[];
    bestTimeToPost?: string;
  }[];
  estimatedEngagement?: {
    platform: Platform;
    likes: number;
    comments: number;
    shares: number;
  }[];
}

// ============================================================================
// Error Handling
// ============================================================================

export interface PostError {
  code: string;
  message: string;
  platform?: Platform;
  details?: Record<string, any>;
  timestamp: Date;
}

export enum PostErrorCode {
  INVALID_CONTENT = 'INVALID_CONTENT',
  MEDIA_UPLOAD_FAILED = 'MEDIA_UPLOAD_FAILED',
  PLATFORM_ERROR = 'PLATFORM_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  DRAFT_NOT_FOUND = 'DRAFT_NOT_FOUND',
  ACCOUNT_DISCONNECTED = 'ACCOUNT_DISCONNECTED',
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: PostError;
  timestamp: Date;
}

// ============================================================================
// Workflow Execution
// ============================================================================

export interface PostPublishingContext {
  postId: string;
  draftId: string;
  socialAccountId: string;
  platform: Platform;
  content: PostContent;
  media: PostMedia[];
  postType: PostType;
  externalPostId?: string;
  publishedUrl?: string;
}

export interface WorkflowExecutionResult {
  executionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  results: PostPublishingContext[];
  errors: {
    platform: Platform;
    error: string;
  }[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

// ============================================================================
// Meta API Specific Types
// ============================================================================

export interface MetaAccessToken {
  accessToken: string;
  expiresIn: number;
  expiresAt: Date;
  tokenType: string;
  isExpired: boolean;
}

export interface MetaPageInfo {
  id: string;
  name: string;
  picture: string;
  link: string;
  category: string;
  instagramBusinessAccountId?: string;
}

export interface MetaInsightsData {
  facebookPageInsights: FacebookInsights;
  instagramInsights: InstagramInsights;
}

export interface FacebookInsights {
  pageImpressionsUnique: number;
  pageEngagement: number;
  pages_posts_impressions: number;
}

export interface InstagramInsights {
  impressions: number;
  profile_views: number;
  reach: number;
}

// ============================================================================
// Engagement (Comments & DMs)
// ============================================================================

export interface SocialComment {
  id: string;
  text: string;
  from: {
    id: string;
    username: string;
  };
  createdAt: Date;
  likeCount: number;
  replies?: SocialComment[];
}

export interface SocialConversation {
  id: string;
  updatedTime: Date;
  participants: {
    id: string;
    username: string;
  }[];
  messages: SocialMessage[];
}

export interface SocialMessage {
  id: string;
  text: string;
  from: {
    id: string;
    username: string;
  };
  createdAt: Date;
}

// ============================================================================
// Pagination & Filtering Helpers
// ============================================================================

export interface PaginationParams {
  skip: number;
  take: number;
}

export interface FilterParams {
  status?: ContentStatus[];
  platforms?: SocialPlatform[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface SortParams {
  sortBy: 'date' | 'engagement' | 'reach';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// Dashboard & Statistics
// ============================================================================

export interface PostingDashboardStats {
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  averageEngagementRate: number;
  topPerformingPost: PostListItem;
  weeklyStats: DailyStats[];
  platformBreakdown: {
    platform: Platform;
    posts: number;
    engagement: number;
    reach: number;
  }[];
}

export interface DailyStats {
  date: Date;
  posts: number;
  engagement: number;
  reach: number;
}
