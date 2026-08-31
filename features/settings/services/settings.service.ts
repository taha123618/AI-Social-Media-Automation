import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

export interface BusinessSettingsUpdate {
  name?: string;
  website?: string;
  logo?: string;
  location?: string;
  description?: string;
  industry?: string;
  size?: string;
  timezone?: string;
  autoApproveContent?: boolean;
  requireApprovalForPosts?: boolean;
  contentGuidelines?: string;
}

export interface BusinessProfileUpdate {
  mission?: string;
  vision?: string;
  uvp?: string;
  targetAudience?: string;
  tone?: string;
  industry?: string;
  forbiddenWords?: string[];
  usp?: string;
  watermark?: string;
}

export class SettingsService {
  static async getBusinessSettings(businessId: string) {
    const [business, profile, socialAccounts] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        include: {
          members: {
            include: {
              user: true
            }
          },
          profile: true,
          socialAccounts: true
        }
      }),
      prisma.businessProfile.findUnique({
        where: { businessId }
      }),
      prisma.socialAccount.findMany({
        where: { businessId }
      })
    ]);

    if (!business) {
      return null;
    }

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      website: business.website,
      logo: business.logo,
      description: profile?.mission || null,
      industry: profile?.industry || null,
      size: null, // Not in current schema
      timezone: 'UTC', // Default since not in current schema
      defaultPlatforms: socialAccounts.map(account => account.platform),
      autoApproveContent: false, // Default since not in current schema
      requireApprovalForPosts: true, // Default since not in current schema
      contentGuidelines: profile?.tone || null,
      mission: profile?.mission || null,
      vision: profile?.vision || null,
      uvp: profile?.uvp || null,
      targetAudience: profile?.targetAudience || null,
      tone: profile?.tone || null,
      forbiddenWords: profile?.forbiddenWords || [],
      usp: profile?.usp || null,
      watermark: profile?.watermark || null,
      location: typeof business.location === 'string' ? business.location : (business.location ? JSON.stringify(business.location) : null),
      city: SettingsService.extractCity(business.location),
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    };
  }

  /**
   * Safely extract city/location from string or JSON object
   */
  static extractCity(location: any): string | null {
    if (!location) return null;
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed.city || parsed.address || parsed.fullAddress || parsed.name || location;
        }
        return location;
      } catch {
        // Plain string location (e.g. "Karachi")
        return location;
      }
    }
    if (typeof location === 'object' && location !== null) {
      return location.city || location.address || location.fullAddress || location.name || null;
    }
    return String(location);
  }

  static async updateBusinessSettings(businessId: string, data: BusinessSettingsUpdate) {
    // Update business record
    const businessData: Partial<{
      name: string;
      website: string;
      logo: string;
      location: string;
    }> = {};
    if (data.name !== undefined) businessData.name = data.name;
    if (data.website !== undefined) businessData.website = data.website || '';
    if (data.logo !== undefined) businessData.logo = data.logo || '';
    if (data.location !== undefined) businessData.location = data.location || '';

    const business = await prisma.business.update({
      where: { id: businessId },
      data: businessData
    });

    // Update or create business profile
    const profileData: Partial<{
      mission: string;
      industry: string;
      timezone: string;
      autoApproveContent: boolean;
      requireApprovalForPosts: boolean;
      tone: string;
    }> = {};
    if (data.description !== undefined) profileData.mission = data.description;
    if (data.industry !== undefined) profileData.industry = data.industry;
    if (data.timezone !== undefined) profileData.timezone = data.timezone;
    if (data.autoApproveContent !== undefined) profileData.autoApproveContent = data.autoApproveContent;
    if (data.requireApprovalForPosts !== undefined) profileData.requireApprovalForPosts = data.requireApprovalForPosts;
    if (data.contentGuidelines !== undefined) profileData.tone = data.contentGuidelines;

    const profile = await prisma.businessProfile.upsert({
      where: { businessId },
      create: {
        businessId,
        ...profileData
      },
      update: profileData
    });

    await SystemLogger.logAudit({
      action: "BUSINESS_SETTINGS_UPDATED",
      resource: "Business",
      status: "SUCCESS",
      details: { businessId, updatedFields: Object.keys(data) }
    });

    return {
      business,
      profile
    };
  }

  static async updateBusinessProfile(businessId: string, data: BusinessProfileUpdate) {
    const profile = await prisma.businessProfile.upsert({
      where: { businessId },
      create: {
        businessId,
        ...data
      },
      update: data
    });

    await SystemLogger.logAudit({
      action: "BUSINESS_PROFILE_UPDATED",
      resource: "BusinessProfile",
      status: "SUCCESS",
      details: { businessId, updatedFields: Object.keys(data) }
    });

    return profile;
  }

  static async getUserSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.image,
      timezone: 'UTC', // Default since these fields don't exist in the schema
      language: 'en', // Default since these fields don't exist in the schema
      // Email Dispatch Protocol
      criticalInfrastructureUpdates: true, // Default notification preference
      strategicIntelligence: false, // Default notification preference
      // Real-Time Push Array
      osLevelSignals: true, // Default notification preference
      // Active Signal Feed
      contentPhaseSuccess: true, // Default notification preference
      securityFirewallAlerts: true, // Default notification preference
      collaboratorInvitations: true, // Default notification preference
      globalSystemHealth: false, // Default notification preference
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  static async updateUserSettings(userId: string, data: Partial<{
    name: string;
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
  }>) {
    // For now, we only update the name in the User table
    // Other settings would need a separate UserSettings table
    const userData: Partial<{
      name: string;
    }> = {};

    if (data.name !== undefined) userData.name = data.name;

    const user = await prisma.user.update({
      where: { id: userId },
      data: userData
    });

    await SystemLogger.logAudit({
      action: "USER_SETTINGS_UPDATED",
      resource: "User",
      status: "SUCCESS",
      userId: userId,
      details: { updatedFields: Object.keys(data) }
    });

    return {
      ...user,
      // Return the updated notification preferences
      timezone: data.timezone || 'UTC',
      language: data.language || 'en',
      criticalInfrastructureUpdates: data.criticalInfrastructureUpdates !== undefined ? data.criticalInfrastructureUpdates : true,
      strategicIntelligence: data.strategicIntelligence !== undefined ? data.strategicIntelligence : false,
      osLevelSignals: data.osLevelSignals !== undefined ? data.osLevelSignals : true,
      contentPhaseSuccess: data.contentPhaseSuccess !== undefined ? data.contentPhaseSuccess : true,
      securityFirewallAlerts: data.securityFirewallAlerts !== undefined ? data.securityFirewallAlerts : true,
      collaboratorInvitations: data.collaboratorInvitations !== undefined ? data.collaboratorInvitations : true,
      globalSystemHealth: data.globalSystemHealth !== undefined ? data.globalSystemHealth : false,
    };
  }

  // API Keys
  static async getApiKeys(businessId: string) {
    return prisma.apiKey.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createApiKey(businessId: string, data: { name: string; permissions: string[] }) {
    // Generate a random API key
    const key = `sk_${Buffer.from(crypto.randomUUID()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        name: data.name,
        key,
        permissions: data.permissions,
        businessId
      }
    });

    await SystemLogger.logAudit({
      action: "API_KEY_CREATED",
      resource: "ApiKey",
      status: "SUCCESS",
      details: { businessId, keyId: apiKey.id, name: data.name }
    });

    return apiKey;
  }

  static async deleteApiKey(businessId: string, keyId: string) {
    const result = await prisma.apiKey.deleteMany({
      where: {
        id: keyId,
        businessId
      }
    });

    await SystemLogger.logAudit({
      action: "API_KEY_DELETED",
      resource: "ApiKey",
      status: "SUCCESS",
      details: { businessId, keyId }
    });

    return result;
  }

  // Webhooks
  static async getWebhooks(businessId: string) {
    return prisma.webhook.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createWebhook(businessId: string, data: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
  }) {
    const webhook = await prisma.webhook.create({
      data: {
        name: data.name,
        url: data.url,
        events: data.events,
        secret: data.secret,
        businessId
      }
    });

    await SystemLogger.logAudit({
      action: "WEBHOOK_CREATED",
      resource: "Webhook",
      status: "SUCCESS",
      details: { businessId, webhookId: webhook.id, url: data.url }
    });

    return webhook;
  }

  static async updateWebhook(businessId: string, webhookId: string, data: {
    name?: string;
    url?: string;
    events?: string[];
    secret?: string;
    isActive?: boolean;
  }) {
    const result = await prisma.webhook.updateMany({
      where: {
        id: webhookId,
        businessId
      },
      data
    });

    await SystemLogger.logAudit({
      action: "WEBHOOK_UPDATED",
      resource: "Webhook",
      status: "SUCCESS",
      details: { businessId, webhookId, updatedFields: Object.keys(data) }
    });

    return result;
  }

  static async deleteWebhook(businessId: string, webhookId: string) {
    const result = await prisma.webhook.deleteMany({
      where: {
        id: webhookId,
        businessId
      }
    });

    await SystemLogger.logAudit({
      action: "WEBHOOK_DELETED",
      resource: "Webhook",
      status: "SUCCESS",
      details: { businessId, webhookId }
    });

    return result;
  }
}