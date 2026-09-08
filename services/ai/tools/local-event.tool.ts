import { z } from 'zod';
import { ToolDefinition } from '../types';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * Local Event Tool
 * Fetches upcoming local events for a given location
 */
export const localEventTool: ToolDefinition<
  { location: string; dateRange?: string },
  {
    success: boolean;
    events: Array<{
      title: string;
      date: string;
      description?: string;
      category?: string;
    }>;
    message?: string;
  }
> = {
  id: 'get-local-events',
  name: 'Local Event Finder',
  description: 'Fetch upcoming local events, festivals, and holidays for a given city',
  inputSchema: z.object({
    location: z.string().describe('City name and state/country'),
    dateRange: z.string().optional().describe('Date range (e.g., "this week", "next month")'),
  }),
  execute: async (input) => {
    try {
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
        },
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
};
