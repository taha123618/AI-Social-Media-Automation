import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { BusinessType } from '@/app/generated/prisma/enums';

/**
 * Multi-Location Management Tool
 * Handles operations across multiple business locations within an organization
 */
export const multiLocationTool = createTool({
  id: 'manage-multi-location',
  description: 'Manage settings, analytics, and content customization across multiple business locations',
  inputSchema: z.object({
    organizationId: z.string().describe('The ID of the organization'),
    action: z.enum(['LIST_LOCATIONS', 'GET_AGGREGATED_ANALYTICS', 'SYNC_CONTENT_SETTINGS', 'CUSTOMIZE_FOR_LOCATION', 'ADD_LOCATION', 'GET_STRATEGIC_ADVICE']),
    locationId: z.string().optional().describe('Specific business/location ID for customization'),
    settings: z.any().optional().describe('Settings to sync or customize'),
    locationData: z.object({
      name: z.string(),
      address: z.string(),
      type: z.string(),
    }).optional().describe('Data for adding a new location'),
    query: z.string().optional().describe('Query for strategic advice'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any(),
    message: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const { organizationId, action, locationId, settings } = input;

      switch (action) {
        case 'LIST_LOCATIONS': {
          const businesses = await prisma.business.findMany({
            where: { organizationId },
            select: { id: true, name: true, location: true, businessType: true },
          });
          return { success: true, data: businesses };
        }

        case 'GET_AGGREGATED_ANALYTICS': {
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
        }

        case 'SYNC_CONTENT_SETTINGS': {
          if (!settings) throw new Error('Settings required for sync');
          
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
        }

        case 'CUSTOMIZE_FOR_LOCATION': {
          if (!locationId || !settings) throw new Error('Location ID and settings required');
          
          const business = await prisma.business.findUnique({
            where: { id: locationId },
            include: { profile: true }
          });

          if (!business) throw new Error('Location not found');

          // More advanced customization logic could go here
          // For now, we update the brand voice for the specific location
          const prefs = (business.preferences as any) || {};

          const updated = await prisma.business.update({
            where: { id: locationId },
            data: {
              preferences: {
                ...prefs,
                brandVoice: settings.brandVoice || prefs.brandVoice
              }
            },
          });
          return { success: true, data: updated };
        }

        case 'ADD_LOCATION': {
          if (!input.locationData) throw new Error('Location data required');
          
          const org = await prisma.organization.findFirst({
            where: { businesses: { some: { id: organizationId } } }
          });

          const newLocation = await prisma.business.create({
            data: {
              name: input.locationData.name,
              location: input.locationData.address,
              businessType: input.locationData.type as BusinessType,
              organizationId: org?.id || organizationId,
              // Add other required fields with defaults if necessary
              slug: input.locationData.name.toLowerCase().replace(/\s+/g, '-'),
            }
          });
          return { success: true, data: newLocation };
        }

        case 'GET_STRATEGIC_ADVICE': {
          // This tool call might be used by the agent to gather data before giving advice
          const businesses = await prisma.business.findMany({
            where: { organizationId },
            include: {
              posts: {
                orderBy: { postedAt: 'desc' },
                take: 10,
              }
            }
          });
          return { success: true, data: businesses };
        }

        default:
          return { success: false, data: null, message: 'Invalid action' };
      }
    } catch (error) {
      console.error('MultiLocationTool Error:', error);
      return { success: false, data: null, message: String(error) };
    }
  },
});
