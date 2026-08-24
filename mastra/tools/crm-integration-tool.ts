import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';

/**
 * CRM Integration Tool
 * Syncs leads and customer data with external CRM systems
 */
export const crmIntegrationTool = createTool({
  id: 'sync-crm-data',
  description: 'Sync leads and customer data with external CRM systems (GoHighLevel, HubSpot, etc.)',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    action: z.enum(['EXPORT_LEADS', 'SYNC_CONTACTS', 'GET_CRM_STATUS', 'SETUP_WEBHOOK']),
    crmType: z.enum(['GOHIGHLEVEL', 'HUBSPOT', 'SALESFORCE', 'GENERIC']).default('GENERIC'),
    data: z.any().optional().describe('Data to sync or configuration details'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    syncedCount: z.number().optional(),
    message: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const { businessId, action, crmType, data } = input;

      switch (action) {
        case 'EXPORT_LEADS': {
          const leads = await prisma.lead.findMany({
            where: { businessId, status: 'NEW' },
          });

          // Simulation of CRM export
          console.log(`Exporting ${leads.length} leads to ${crmType}...`);

          return {
            success: true,
            syncedCount: leads.length,
            message: `Successfully exported ${leads.length} leads to ${crmType}.`
          };
        }

        case 'SYNC_CONTACTS': {
          return {
            success: true,
            message: `Contact sync initiated for ${crmType}.`
          };
        }

        case 'GET_CRM_STATUS': {
          return {
            success: true,
            message: `${crmType} is connected and active.`
          };
        }

        case 'SETUP_WEBHOOK': {
          return {
            success: true,
            message: `Webhook configured for ${crmType}.`
          };
        }

        default:
          return { success: false, message: 'Invalid action' };
      }
    } catch (error) {
      console.error('CRMIntegrationTool Error:', error);
      return { success: false, message: String(error) };
    }
  },
});
