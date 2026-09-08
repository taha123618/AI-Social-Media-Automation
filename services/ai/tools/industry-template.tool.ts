import { z } from 'zod';
import { ToolDefinition } from '../types';

/**
 * Industry Growth Templates Tool
 * Provides pre-built 90-day growth plans for various small industries
 */
export const industryTemplateTool: ToolDefinition<
  { industry: string },
  {
    success: boolean;
    template: {
      industry: string;
      phases: Array<{
        name: string;
        duration: string;
        goals: string[];
        contentStrategy: string;
        keyMetrics: string[];
      }>;
      recommendedPostingFrequency: string;
      topContentTopics: string[];
    };
  }
> = {
  id: 'get-industry-template',
  name: 'Industry Growth Template Provider',
  description: 'Fetch a pre-built 90-day growth plan template for a specific industry',
  inputSchema: z.object({
    industry: z.string().describe('The industry type (e.g., "Auto Detailing", "Real Estate", "Coffee Shop")'),
  }),
  execute: async (input) => {
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
          },
        ],
        recommendedPostingFrequency: '5-7 times per week',
        topContentTopics: ['Ceramic coating benefits', 'Interior deep clean process', 'Mobile service convenience'],
      },
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
        },
      ],
      recommendedPostingFrequency: '3-5 times per week',
      topContentTopics: ['Industry tips', 'Customer success stories', 'Behind the scenes'],
    };

    return {
      success: true,
      template,
    };
  },
};
