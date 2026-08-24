export interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  timezone: string;
  language: string;
  // Email Dispatch Protocol
  criticalInfrastructureUpdates: boolean;
  strategicIntelligence: boolean;
  // Real-Time Push Array
  osLevelSignals: boolean;
  // Active Signal Feed
  contentPhaseSuccess: boolean;
  securityFirewallAlerts: boolean;
  collaboratorInvitations: boolean;
  globalSystemHealth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessSettings {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  location?: any | null;
  logo: string | null;
  description: string | null;
  industry: string | null;
  size: string | null;
  timezone: string;
  defaultPlatforms: string[];
  autoApproveContent: boolean;
  requireApprovalForPosts: boolean;
  contentGuidelines: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialAccount {
  id: string;
  platform: 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE';
  accountName: string;
  accountId: string;
  isActive: boolean;
  lastSync: Date | null;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
