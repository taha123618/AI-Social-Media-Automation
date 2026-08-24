import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Industry Growth Templates Tool
 * Provides pre-built 90-day growth plans for various small industries
 */
export const industryTemplateTool = createTool({
  id: 'get-industry-template',
  description: 'Fetch a pre-built 90-day growth plan template for a specific industry',
  inputSchema: z.object({
    industry: z.string().describe('The industry type (e.g., "Auto Detailing", "Real Estate", "Coffee Shop")'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    template: z.object({
      industry: z.string(),
      phases: z.array(z.object({
        name: z.string(),
        duration: z.string(),
        goals: z.array(z.string()),
        contentStrategy: z.string(),
        keyMetrics: z.array(z.string()),
      })),
      recommendedPostingFrequency: z.string(),
      topContentTopics: z.array(z.string()),
    }),
  }),
  execute: async (input) => {
    // These templates would ideally be stored in a database or a structured file.
    // For now, we provide a few examples and a generic generator logic.
    
    const templates: Record<string, any> = {
      'Auto Detailing': {
        industry: 'Auto Detailing',
        phases: [
          {
            name: 'Foundation & Trust',
            duration: 'Day 1-30',
            goals: ['Showcase quality', 'Build local awareness'],
            contentStrategy: 'Before/After shots, process videos, customer testimonials.',
            keyMetrics: ['Follower growth', 'Saves'],
          },
          {
            name: 'Engagement & Education',
            duration: 'Day 31-60',
            goals: ['Educate on paint protection', 'Increase DM inquiries'],
            contentStrategy: 'Tips on maintenance, FAQ videos, "How it works" reels.',
            keyMetrics: ['Comments', 'DM inquiries'],
          },
          {
            name: 'Conversion & Loyalty',
            duration: 'Day 61-90',
            goals: ['Direct bookings', 'Repeat customers'],
            contentStrategy: 'Limited time offers, loyalty program highlights, seasonal specials.',
            keyMetrics: ['Booking clicks', 'Repeat visits'],
          }
        ],
        recommendedPostingFrequency: '5-7 times per week',
        topContentTopics: ['Ceramic coating benefits', 'Interior deep clean process', 'Mobile service convenience'],
      },
      // Add more industries as needed
    };

    const template = templates[input.industry] || {
      industry: input.industry,
      phases: [
        {
          name: 'Awareness',
          duration: 'Phase 1',
          goals: ['Visibility'],
          contentStrategy: 'Introduction and value proposition.',
          keyMetrics: ['Reach'],
        },
        {
          name: 'Consideration',
          duration: 'Phase 2',
          goals: ['Interest'],
          contentStrategy: 'Educational and social proof.',
          keyMetrics: ['Engagement'],
        },
        {
          name: 'Conversion',
          duration: 'Phase 3',
          goals: ['Sales'],
          contentStrategy: 'Direct offers and CTAs.',
          keyMetrics: ['Leads'],
        }
      ],
      recommendedPostingFrequency: '3-5 times per week',
      topContentTopics: ['Industry tips', 'Customer success stories', 'Behind the scenes'],
    };

    return {
      success: true,
      template,
    };
  },
});
