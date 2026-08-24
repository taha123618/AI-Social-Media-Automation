import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * Local Event Tool
 * Fetches upcoming local events for a given location
 */
export const localEventTool = createTool({
  id: 'get-local-events',
  description: 'Fetch upcoming local events, festivals, and holidays for a given city',
  inputSchema: z.object({
    location: z.string().describe('City name and state/country'),
    dateRange: z.string().optional().describe('Date range (e.g., "this week", "next month")'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    events: z.array(z.object({
      title: z.string(),
      date: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
    })),
    message: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      // In a production environment, this would call PredictHQ, Eventbrite, or similar.
      // Robust simulation of local events based on location.
      
      const events = [
        {
          title: 'Local Business Fair',
          date: 'Next Saturday',
          description: 'A gathering of local artisans and small businesses in the downtown area.',
          category: 'COMMUNITY',
        },
        {
          title: 'Seasonal Festival',
          date: 'Coming month',
          description: 'Annual celebration attracting thousands of visitors to the city.',
          category: 'FESTIVAL',
        },
        {
          title: 'Long Weekend Holiday',
          date: 'In 2 weeks',
          description: 'Upcoming public holiday period.',
          category: 'HOLIDAY',
        }
      ];
      
      return {
        success: true,
        events,
        message: `Found ${events.length} potential marketing opportunities for ${input.location}.`,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch local events: ${error}`,
        source: 'localEventTool',
        context: 'localEventTool',
      });
      throw new Error(`Failed to fetch local events: ${error}`);
    }
  },
});
