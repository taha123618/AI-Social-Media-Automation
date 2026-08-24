// Centralized type exports to standardize across the codebase
// This prevents type mismatches between different Prisma import sources

// Platform types - use generated enums for application logic
import {
  Platform,
  ContentIntent,
  ContentStatus,
  UserRole,
  BusinessType
} from '@/app/generated/prisma/enums';

// Re-export for convenience
export {
  Platform,
  ContentIntent,
  ContentStatus,
  UserRole,
  BusinessType
};

// Type aliases for database operations
export type PrismaPlatform = Platform;
export type PrismaContentIntent = ContentIntent;
export type PrismaContentStatus = ContentStatus;
export type PrismaUserRole = UserRole;
export type PrismaBusinessType = BusinessType;

// Helper functions for type casting
export function toPrismaPlatform(platform: Platform): PrismaPlatform {
  return platform as PrismaPlatform;
}

export function toPrismaContentIntent(intent: ContentIntent): PrismaContentIntent {
  return intent as PrismaContentIntent;
}

export function toPrismaContentStatus(status: ContentStatus): PrismaContentStatus {
  return status as PrismaContentStatus;
}

export function toPrismaUserRole(role: UserRole): PrismaUserRole {
  return role as PrismaUserRole;
}

export function toPrismaBusinessType(type: BusinessType): PrismaBusinessType {
  return type as PrismaBusinessType;
}

// Common business types
export interface BusinessProfileInput {
  mission?: string;
  vision?: string;
  uvp?: string;
  targetAudience?: string;
  tone?: string;
  industry?: string;
  forbiddenWords?: string[] | string;
  brandTone?: import('@/features/knowledge/types').BrandTone;
  usp?: string;
  colorPalette?: string[];
  watermark?: string;
}

export interface UserSettings {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  language: string;
  criticalInfrastructureUpdates: boolean;
  strategicIntelligence: boolean;
  osLevelSignals: boolean;
  contentPhaseSuccess: boolean;
  securityFirewallAlerts: boolean;
  collaboratorInvitations: boolean;
  globalSystemHealth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  platformId: string;
  name?: string;
  avatar?: string;
  profileUrl?: string;
  isActive: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

export interface ContentDraft {
  id: string;
  title?: string;
  intent: ContentIntent;
  platforms: Platform[];
  customPrompt?: string;
  status: ContentStatus;
  scheduledFor?: Date;
  postedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  businessId: string;
  creatorId: string;
  contentJson?: Record<string, unknown>;
}

export interface Post {
  id: string;
  businessId: string;
  creatorId: string;
  draftId: string;
  externalPostId?: string;
  platform: Platform;
  postedAt: Date;
  publishedUrl?: string;
  socialAccountId: string;
  scheduledFor?: Date;
  executionId?: string;
  workflowId?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation schemas types
export interface CreateContentRequest {
  content: string;
  platforms: Platform[];
  accountIds: string[];
  intent: ContentIntent;
  scheduledFor?: string; // ISO date string
  mediaFiles?: File[];
  isImmediate?: boolean;
}

export interface UpdateContentRequest {
  title?: string;
  intent?: ContentIntent;
  platforms?: Platform[];
  customPrompt?: string;
  status?: ContentStatus;
  scheduledFor?: string; // ISO date string
}

export interface BulkOperationRequest {
  ids: string[];
  operation: 'delete' | 'update';
  data?: Partial<UpdateContentRequest>;
}

// OAuth types
export interface OAuthState {
  id: string;
  businessId: string;
  platform: Platform;
  tokenData: Record<string, unknown>;
  expiresAt: Date;
}

export interface OAuthCallback {
  code: string;
  state: string; // businessId or secure state token
  platform: string;
}

// Error types (re-export from error handler)
export { ErrorCode, AppError, ValidationError, AuthorizationError, BusinessRuleError, ExternalServiceError } from '@/lib/error-handler';

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
