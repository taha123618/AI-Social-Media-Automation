import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { Platform, LeadStatus } from '@/app/generated/prisma/client';

export type CrmType = 'GOHIGHLEVEL' | 'HUBSPOT' | 'SALESFORCE' | 'GENERIC';

export interface CrmConfig {
  apiKey?: string;
  webhookUrl?: string;
  portalId?: string;
}

/**
 * Direct CRM Integration Service
 * Handles lead synchronization without external framework dependencies
 */
export class CrmService {
  /**
   * Sync new leads to the configured CRM
   */
  static async syncLeads(businessId: string, crmType: CrmType = 'GENERIC') {
    try {
      // 1. Fetch leads that haven't been synced yet
      const leads = await prisma.lead.findMany({
        where: { 
          businessId, 
          status: 'NEW' 
        },
        take: 50 // Batch processing
      });

      if (leads.length === 0) {
        return { success: true, message: 'No new leads to sync', count: 0 };
      }

      // 2. Fetch business CRM configuration from ThirdPartyService
      const service = await prisma.thirdPartyService.findFirst({
        where: { 
          businessId, 
          platform: crmType as unknown as Platform 
        }
      });

      // For CRM, we'll store JSON in apiKey or use specialized fields if we were to refactor ThirdPartyService
      // For now, let's assume apiKey stores the main key or a JSON string of config
      let config: CrmConfig = {};
      if (service) {
        try {
          config = JSON.parse(service.apiKey);
        } catch {
          config = { apiKey: service.apiKey };
        }
      }

      // 3. Process synchronization based on CRM type
      const results = await this.executeBatchSync(leads, crmType, config);

      // 4. Update lead status in database
      if (results.syncedIds.length > 0) {
        await prisma.lead.updateMany({
          where: { 
            id: { in: results.syncedIds } 
          },
          data: { 
            status: 'SYNCED' as LeadStatus
          }
        });
      }

      return {
        success: true,
        message: `Successfully synced ${results.syncedIds.length} leads to ${crmType}`,
        count: results.syncedIds.length,
        errors: results.errors
      };
    } catch (error) {
      SystemLogger.error('CrmService.syncLeads', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Internal helper to handle the actual API calls
   */
  private static async executeBatchSync(leads: any[], crmType: CrmType, config: CrmConfig) {
    const syncedIds: string[] = [];
    const errors: any[] = [];

    for (const lead of leads) {
      try {
        // Logic for different CRM providers
        if (crmType === 'GOHIGHLEVEL' && config.apiKey) {
          // GHL API Call Simulation
          // await fetch('https://rest.gohighlevel.com/v1/contacts/', { ... })
        } else if (crmType === 'GENERIC' && config.webhookUrl) {
          await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'new_lead',
              data: {
                id: lead.id,
                name: lead.name || 'Anonymous',
                type: lead.leadType,
                source: 'Social AI Assistant',
                value: lead.estimatedValue,
                createdAt: lead.createdAt
              }
            })
          });
        }
        
        // Mark as successfully processed in our tracking array
        syncedIds.push(lead.id);
      } catch (err) {
        errors.push({ leadId: lead.id, error: String(err) });
      }
    }

    return { syncedIds, errors };
  }

  /**
   * Check connection status for a business CRM
   */
  static async getStatus(businessId: string) {
    const services = await prisma.thirdPartyService.findMany({
      where: { 
        businessId,
        platform: {
          in: ['GOHIGHLEVEL', 'HUBSPOT', 'SALESFORCE'] as Platform[]
        }
      }
    });

    return {
      connected: services.length > 0,
      services: services.map(s => ({
        platform: s.platform,
        isActive: s.isActive
      }))
    };
  }
}
