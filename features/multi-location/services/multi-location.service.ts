import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { BusinessType } from '@/app/generated/prisma/enums';
import { AIService } from '@/services/ai/ai.service';

/**
 * Direct Multi-Location Service
 * Handles aggregated analytics and cross-location settings using AI services
 */
export class MultiLocationService {
  /**
   * Helper to retrieve organizationId; falls back to businessId if missing
   */
  private static async getOrgId(businessId: string): Promise<string> {
    const biz = await prisma.business.findUnique({
      where: { id: businessId },
      select: { organizationId: true }
    });
    return biz?.organizationId ?? businessId;
  }

  /**
   * Get all business locations for an organization
   */
  static async getLocations(businessId: string) {
    try {
      const organizationId = await this.getOrgId(businessId);
      const businesses = await prisma.business.findMany({
        where: { organizationId },
        select: { id: true, name: true, location: true, businessType: true },
      });
      return { success: true, data: businesses };
    } catch (error) {
      SystemLogger.error('MultiLocationService.getLocations', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get aggregated performance metrics across all locations
   */
  static async getAggregatedAnalytics(businessId: string) {
    try {
      const organizationId = await this.getOrgId(businessId);

      const businesses = await prisma.business.findMany({
        where: { organizationId },
        include: {
          posts: {
            where: { status: 'POSTED' },
            select: { likes: true, comments: true, shares: true, messageClicks: true, bookingClicks: true },
          },
        },
      });

      const aggregate = businesses.reduce((acc, b) => {
        const stats = b.posts.reduce((pAcc, p) => ({
          engagement: pAcc.engagement + (p.likes || 0) + (p.comments || 0) + (p.shares || 0),
          leads: pAcc.leads + (p.messageClicks || 0) + (p.bookingClicks || 0),
        }), { engagement: 0, leads: 0 });

        return {
          totalEngagement: acc.totalEngagement + stats.engagement,
          totalLeads: acc.totalLeads + stats.leads,
          locationCount: acc.locationCount + 1,
        };
      }, { totalEngagement: 0, totalLeads: 0, locationCount: 0 });

      return { success: true, data: aggregate };
    } catch (error) {
      SystemLogger.error('MultiLocationService.getAggregatedAnalytics', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Sync settings (like Brand Voice) across all business locations
   */
  static async syncGlobalSettings(businessId: string, settings: { brandVoice?: string }) {
    try {
      const organizationId = await this.getOrgId(businessId);

      const businesses = await prisma.business.findMany({
        where: { organizationId },
        select: { id: true, preferences: true }
      });

      await Promise.all(businesses.map(b => {
        const prefs = (b.preferences as any) || {};
        return prisma.business.update({
          where: { id: b.id },
          data: {
            preferences: {
              ...prefs,
              brandVoice: settings.brandVoice
            }
          }
        });
      }));

      return { success: true, data: { status: 'SYNCED' } };
    } catch (error) {
      SystemLogger.error('MultiLocationService.syncGlobalSettings', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Use custom AI agent to provide strategic advice for the multi-location business
   */
  static async getStrategicAdvice(businessId: string, query: string) {
    try {
      const organizationId = await this.getOrgId(businessId);
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { name: true }
      });

      const { multiLocationAgent } = await import('@/services/ai/agents/multi-location.agent');
      const text = await multiLocationAgent.generateResponse?.(query, {
        businessId,
        organizationId,
        businessName: business?.name,
      }) || await AIService.generateWithOpenRouter({
        prompt: `Multi-location business "${business?.name}" strategic advice: ${query}`
      });

      return { success: true, data: text };
    } catch (error) {
      SystemLogger.error('MultiLocationService.getStrategicAdvice', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Add a new location to the organization
   */
  static async addLocation(businessId: string, locationData: { name: string, address: string, type: BusinessType }) {
    try {
      const orgId = await this.getOrgId(businessId);
      const newLocationData: any = {
        name: locationData.name,
        location: locationData.address,
        businessType: locationData.type,
        slug: locationData.name.toLowerCase().replace(/\s+/g, '-'),
        organizationId: orgId,
      };
      const newLocation = await prisma.business.create({
        data: newLocationData,
      });
      return { success: true, data: newLocation };
    } catch (error) {
      SystemLogger.error('MultiLocationService.addLocation', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Direct AI Implementation for location-based customization
   * Uses AI agent or tool to adapt content for specific local nuances
   */
  static async customizeContentForLocation(locationId: string, baseContent: string) {
    try {
      const business = await prisma.business.findUnique({
        where: { id: locationId },
        select: { 
          name: true, 
          location: true, 
          businessType: true,
          organizationId: true
        }
      });

      if (!business) return { success: false, error: 'Location not found' };

      const { multiLocationTool } = await import('@/services/ai/tools/multi-location.tool');
      const result = await multiLocationTool.execute({
        organizationId: business.organizationId || locationId,
        action: 'CUSTOMIZE_FOR_LOCATION',
        settings: { baseContent },
        locationId,
      });

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      const prompt = `Adapt this social media content for "${business.name}" (${business.location}, ${business.businessType}):\n\n${baseContent}`;
      const text = await AIService.generateWithOpenRouter({ prompt });

      return { success: true, data: text };
    } catch (error) {
      SystemLogger.error('MultiLocationService.customizeContentForLocation', error);
      return { success: false, error: String(error) };
    }
  }
}
