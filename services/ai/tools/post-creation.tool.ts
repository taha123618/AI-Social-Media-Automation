import { z } from 'zod';
import { ToolDefinition } from '../types';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { Platform } from '@/app/generated/prisma/enums';
import { AIService } from '../ai.service';

const ContentToneEnum = z.enum([
  'PROFESSIONAL',
  'CASUAL',
  'PLAYFUL',
  'INSPIRATIONAL',
  'COMEDIC',
  'EDUCATIONAL',
  'MOTIVATIONAL',
  'URGENT',
]);

/**
 * Generate Content Tool
 * Generates optimized social media content for specific platforms
 */
export const generateContentTool: ToolDefinition<
  {
    prompt: string;
    platforms: Platform[];
    tone: string;
    includeHashtags?: boolean;
    includeCTA?: boolean;
    existingContent?: string;
    regenerationGoal?: string;
  },
  {
    success: boolean;
    content: Record<
      string,
      {
        text: string;
        hashtags: string[];
        callToAction?: string;
      }
    >;
    message: string;
  }
> = {
  id: 'generate-post-content',
  name: 'Social Post Generator',
  description: 'Generate optimized social media content for specific platforms with platform-specific constraints',
  inputSchema: z.object({
    prompt: z.string().describe('The topic or description for the post'),
    platforms: z.array(z.nativeEnum(Platform)).describe('Target platforms'),
    tone: ContentToneEnum.describe('Content tone or style'),
    includeHashtags: z.boolean().optional().default(true),
    includeCTA: z.boolean().optional().default(true),
    existingContent: z.string().optional(),
    regenerationGoal: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const generatedContent: Record<
        string,
        {
          text: string;
          hashtags: string[];
          callToAction?: string;
        }
      > = {};

      for (const platform of input.platforms) {
        const prompt = `You are an expert social media copywriter.
Generate a high-converting post for ${platform}.
Topic / Request: ${input.prompt}
Tone: ${input.tone}
${input.existingContent ? `Existing content to refine: "${input.existingContent}"` : ''}
${input.regenerationGoal ? `Goal for revision: "${input.regenerationGoal}"` : ''}

Respond in JSON with this exact format:
{
  "text": "The main post caption",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "callToAction": "Optional call to action line"
}`;

        const rawResult = await AIService.generateWithOpenRouter({
          prompt,
          temperature: 0.7,
        });

        try {
          const cleanJson = rawResult.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          generatedContent[platform] = {
            text: parsed.text || rawResult,
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
            callToAction: parsed.callToAction || undefined,
          };
        } catch {
          generatedContent[platform] = {
            text: rawResult,
            hashtags: input.includeHashtags ? ['#trending', '#viral', '#business'] : [],
            callToAction: input.includeCTA ? 'Click the link in bio to learn more!' : undefined,
          };
        }
      }

      return {
        success: true,
        content: generatedContent,
        message: `Content generated successfully for ${input.platforms.length} platform(s)`,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to generate content: ${error}`,
        source: 'postCreationTool',
        context: 'generateContentTool',
      });
      throw new Error(`Failed to generate content: ${error}`);
    }
  },
};

/**
 * Schedule Post Tool
 */
export const schedulePostTool: ToolDefinition<
  {
    postId: string;
    scheduledFor: string;
    timezone?: string;
  },
  {
    success: boolean;
    post?: any;
    message: string;
  }
> = {
  id: 'schedule-post',
  name: 'Post Scheduler',
  description: 'Schedule a post for future publication',
  inputSchema: z.object({
    postId: z.string().describe('The ID of the post to schedule'),
    scheduledFor: z.string().describe('ISO 8601 datetime string when the post should be published'),
    timezone: z.string().optional().default('UTC'),
  }),
  execute: async (input) => {
    try {
      const scheduledDate = new Date(input.scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Invalid date format for scheduledFor');
      }

      const post = await prisma.post.update({
        where: { id: input.postId },
        data: {
          scheduledFor: scheduledDate,
          status: 'SCHEDULED',
        },
      });

      return {
        success: true,
        post,
        message: `Post scheduled for ${scheduledDate.toISOString()}`,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to schedule post: ${error}`,
        source: 'postCreationTool',
        context: 'schedulePostTool',
      });
      throw new Error(`Failed to schedule post: ${error}`);
    }
  },
};

/**
 * Get Post Analytics Tool
 */
export const getPostAnalyticsTool: ToolDefinition<
  {
    postId: string;
  },
  {
    success: boolean;
    metrics: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
      clicks: number;
      engagementRate: number;
    };
    message?: string;
  }
> = {
  id: 'get-post-analytics',
  name: 'Post Performance Inspector',
  description: 'Get performance metrics for a specific post',
  inputSchema: z.object({
    postId: z.string().describe('The ID of the post'),
  }),
  execute: async (input) => {
    const post = await prisma.post.findUnique({
      where: { id: input.postId },
    });

    if (!post) {
      throw new Error(`Post not found: ${input.postId}`);
    }

    const likes = post.likes || 0;
    const comments = post.comments || 0;
    const shares = post.shares || 0;
    const views = post.impressions || post.videoViews || 0;
    const clicks = (post.messageClicks || 0) + (post.bookingClicks || 0);
    const totalEngagement = likes + comments + shares;
    const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;

    return {
      success: true,
      metrics: {
        likes,
        comments,
        shares,
        views,
        clicks,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
      },
    };
  },
};
