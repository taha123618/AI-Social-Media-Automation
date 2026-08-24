import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { BusinessType } from '@/app/generated/prisma/enums';
import { AIService } from '@/services/ai/ai.service';

/**
 * Direct Multi-Location Service
 * Handles aggregated analytics and cross-location settings using Mastra agents
 */
export class MultiLocationService {
  /**
   * Get all business locations for an organization
   */
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
   * Use direct AI integration to provide strategic advice for the multi-location business
   */
  static async getStrategicAdvice(businessId: string, query: string) {
    try {
      const organizationId = await this.getOrgId(businessId);
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { name: true }
      });

      const prompt = `
        The user is asking for strategic advice for their multi-location business "${business?.name}".
        Query: ${query}
        
        Please provide a detailed strategic recommendation based on the current business context.
      `;

      const text = await AIService.generateWithOpenRouter({ prompt });

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
        // Prepare data for new location
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
   * Uses AI directly to adapt content for specific local nuances
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

      const prompt = `
        Adapt the following social media content for a specific business location.
        
        Location Name: ${business.name}
        Address: ${business.location}
        Business Type: ${business.businessType}
        
        Content to adapt:
        ${baseContent}
        
        Make it sound local and relevant to this specific branch while maintaining the overall message.
      `;

      const text = await AIService.generateWithOpenRouter({ prompt });

      return { success: true, data: text };
    } catch (error) {
      SystemLogger.error('MultiLocationService.customizeContentForLocation', error);
      return { success: false, error: String(error) };
    }
  }
}
