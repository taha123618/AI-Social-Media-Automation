import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import { Platform, ContentStatus } from '@/app/generated/prisma/client';
import { PostMetrics, PostContent } from '@/features/social/types/social-posting.types';

/**
 * Content Tone Types
 */
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
export const generateContentTool = createTool({
  id: 'generate-post-content',
  description: 'Generate optimized social media content for specific platforms with platform-specific constraints',
  inputSchema: z.object({
    prompt: z.string().describe('The topic or description for the post'),
    platforms: z
      .array(z.nativeEnum(Platform))
      .describe('Target platforms (FACEBOOK, INSTAGRAM, TWITTER, TIKTOK)'),
    tone: ContentToneEnum.describe('Content tone or style'),
    includeHashtags: z.boolean().optional().default(true).describe('Whether to include hashtags'),
    includeCTA: z.boolean().optional().default(true).describe('Whether to include a call-to-action'),
    existingContent: z.string().optional().describe('Previous content to improve or regenerate'),
    regenerationGoal: z.string().optional().describe('Specific goal for regeneration (e.g., "make it shorter", "more emojis")'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content: z.record(
      z.string(),
      z.object({
        text: z.string(),
        hashtags: z.array(z.string()),
        callToAction: z.string().optional(),
      })
    ),
    message: z.string(),
  }),
  execute: async (input, context) => {
    try {
      const mastra = context?.mastra;
      // Get the agent from context or use a default model if mastra is not available
      const agent = mastra?.getAgent('post-creation-agent');
      
      if (!agent) {
        throw new Error('Agent "post-creation-agent" not found in Mastra context');
      }

      const prompt = input.existingContent 
        ? `Regenerate this social media content: ${input.existingContent}\n\nGoal: ${input.regenerationGoal || 'Improve the content'}\n\nTarget platforms: ${input.platforms.join(', ')}`
        : `Create social media content for: ${input.prompt}\n\nTarget platforms: ${input.platforms.join(', ')}`;

      const response = await agent.generate(prompt, {
        structuredOutput: {
          schema: z.object({
            platforms: z.record(
              z.string(),
              z.object({
                text: z.string(),
                hashtags: z.array(z.string()),
                callToAction: z.string().optional(),
              })
            ),
          }),
        },
      });

      const parsedContent = response.object.platforms;

      // Final validation and fallback check
      for (const platform of input.platforms) {
        if (!parsedContent[platform]) {
           // Fallback for missing platforms
           parsedContent[platform] = {
             text: response.text || '',
             hashtags: [],
           };
        }
        
        // Ensure character limits are respected even if model missed it
        if (platform === Platform.TWITTER && parsedContent[platform].text.length > 280) {
          parsedContent[platform].text = parsedContent[platform].text.substring(0, 277) + '...';
        } else if (platform === Platform.TIKTOK && parsedContent[platform].text.length > 2200) {
          parsedContent[platform].text = parsedContent[platform].text.substring(0, 2197) + '...';
        }
      }

      return {
        success: true,
        content: parsedContent,
        message: 'Content generated successfully',
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
});

/**
 * Image Generation Tool
 * Generates AI images for social media posts
 */
export const imageGenerationTool = createTool({
  id: 'generate-post-image',
  description: 'Generate an AI image for a social media post using DALL-E 3',
  inputSchema: z.object({
    prompt: z.string().describe('The description of the image to generate'),
    aspectRatio: z.enum(['SQUARE', 'LANDSCAPE']).default('SQUARE').describe('Image aspect ratio'),
    quality: z.enum(['standard', 'hd']).default('standard'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    imageUrl: z.string().optional(),
    message: z.string(),
  }),
  execute: async (input) => {
    try {
      const size = input.aspectRatio === 'LANDSCAPE' ? '1792x1024' : '1024x1024';
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: input.prompt,
          n: 1,
          size,
          quality: input.quality,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return {
        success: true,
        imageUrl: data.data?.[0]?.url,
        message: 'Image generated successfully',
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to generate image: ${error}`,
        source: 'postCreationTool',
        context: 'imageGenerationTool',
      });
      throw new Error(`Failed to generate image: ${error}`);
    }
  },
});

/**
 * Publish Post Tool
 * Publishes a draft post to selected social media platforms
 */
export const publishPostTool = createTool({
  id: 'publish-post',
  description: 'Publish a draft post to one or more social media platforms',
  inputSchema: z.object({
    draftId: z.string().describe('The ID of the draft to publish'),
    socialAccountIds: z.array(z.string()).describe('The social account IDs to publish to'),
    publishImmediately: z.boolean().optional().default(true).describe('Publish now or schedule'),
    scheduledFor: z.date().optional().describe('When to publish (if scheduling)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    results: z.array(
      z.object({
        platform: z.string(),
        postId: z.string(),
        externalPostId: z.string(),
        success: z.boolean(),
        error: z.string().optional(),
      })
    ),
  }),
  execute: async (input) => {
    try {
      const draft = await prisma.contentDraft.findUnique({
        where: { id: input.draftId },
        include: {
          business: true,
        },
      });

      if (!draft) {
        throw new Error(`Draft not found: ${input.draftId}`);
      }

      const accounts = await prisma.socialAccount.findMany({
        where: { id: { in: input.socialAccountIds } },
      });

      interface PublishResult {
        platform: string;
        postId: string;
        externalPostId: string;
        success: boolean;
        error?: string;
      }
      const results: PublishResult[] = [];

      for (const account of accounts) {
        try {
          const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);
          interface PublishResponse {
            postId: string;
            url?: string;
            containerIds?: string[];
          }
          let publishResult: PublishResponse;

          if (account.platform === Platform.FACEBOOK) {
            publishResult = await MetaBusinessManagerService.publishToFacebook(
              account.platformId,
              accessToken,
              (draft.contentJson as unknown as PostContent) || {},
              draft.mediaUrl ? [draft.mediaUrl] : undefined
            );
          } else if (account.platform === Platform.INSTAGRAM) {
            const containerResult = await MetaBusinessManagerService.publishToInstagram(
              account.platformId,
              accessToken,
              (draft.contentJson as unknown as PostContent) || {},
              draft.mediaUrl ? [draft.mediaUrl] : undefined
            );
            publishResult = { postId: containerResult.containerIds[0] };
          } else {
            throw new Error(`Unsupported platform: ${account.platform}`);
          }

          // Create Post record in database
          const post = await prisma.post.create({
            data: {
              businessId: draft.businessId,
              creatorId: draft.creatorId,
              draftId: draft.id,
              platform: account.platform,
              externalPostId: publishResult.postId,
              socialAccountId: account.id,
              publishedUrl: publishResult.url || `https://${account.platform.toLowerCase()}.com`,
              postedAt: input.publishImmediately ? new Date() : undefined,
              scheduledFor: input.scheduledFor,
            },
          });

          // PostAnalytics are now flattened into Post model

          results.push({
            platform: account.platform,
            postId: post.id,
            externalPostId: publishResult.postId,
            success: true,
          });

          await SystemLogger.logActivity({
            action: 'post_published',
            entity: 'post',
            entityId: post.id,
            details: { platform: account.platform, context: 'publishPostTool' },
          });
        } catch (error) {
          const errorMsg = `${error}`;
          results.push({
            platform: account.platform,
            postId: '',
            externalPostId: '',
            success: false,
            error: errorMsg,
          });

          await SystemLogger.logError({
            message: `Failed to publish to ${account.platform}: ${error}`,
            source: 'postCreationTool',
            context: 'publishPostTool',
          });
        }
      }

      // Update draft status
      const hasSuccess = results.some((r) => r.success);
      if (hasSuccess) {
        await prisma.contentDraft.update({
          where: { id: draft.id },
          data: {
            status: input.publishImmediately ? ContentStatus.POSTED : ContentStatus.SCHEDULED,
            postedAt: input.publishImmediately ? new Date() : undefined,
            scheduledFor: input.scheduledFor,
          },
        });
      }

      return {
        success: hasSuccess,
        results,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Publish post tool failed: ${error}`,
        source: 'postCreationTool',
        context: 'publishPostTool',
      });
      throw new Error(`Failed to publish post: ${error}`);
    }
  },
});

/**
 * Fetch Analytics Tool
 * Fetches and updates analytics for a published post
 */
export const fetchAnalyticsTool = createTool({
  id: 'fetch-post-analytics',
  description: 'Fetch analytics for a published post from social media platforms',
  inputSchema: z.object({
    postId: z.string().describe('The ID of the post to fetch analytics for'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    metrics: z
      .object({
        engagement: z.object({
          likes: z.number(),
          comments: z.number(),
          shares: z.number(),
          saves: z.number().optional(),
        }),
        reach: z.object({
          impressions: z.number(),
          reach: z.number(),
          profileVisits: z.number().optional(),
        }),
        video: z
          .object({
            views: z.number(),
            watchTime: z.number(),
            averageWatchTime: z.string(),
            completionRate: z.number(),
          })
          .optional(),
        click: z
          .object({
            linkClicks: z.number(),
            websiteClicks: z.number(),
            bookingClicks: z.number().optional(),
            phoneClicks: z.number().optional(),
          })
          .optional(),
        story: z
          .object({
            impressions: z.number(),
            replies: z.number(),
            exits: z.number(),
            taps: z.number(),
          })
          .optional(),
      })
      .optional(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const post = await prisma.post.findUnique({
        where: { id: input.postId },
        include: {
          socialAccount: true,
        },
      });

      if (!post || !post.externalPostId) {
        throw new Error(`Post not found or has no external ID`);
      }

      const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(post.socialAccount);
      let metrics: PostMetrics | undefined;

      if (post.platform === Platform.FACEBOOK) {
        metrics = await MetaBusinessManagerService.getFacebookPostInsights(
          post.externalPostId,
          accessToken
        );
      } else if (post.platform === Platform.INSTAGRAM) {
        metrics = await MetaBusinessManagerService.getInstagramMediaInsights(
          post.externalPostId,
          accessToken
        );
      }

      // Update metrics directly on the Post
      if (metrics) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            likes: metrics.engagement?.likes || 0,
            comments: metrics.engagement?.comments || 0,
            shares: metrics.engagement?.shares || 0,
            saves: metrics.engagement?.saves || 0,
            impressions: metrics.reach?.impressions || 0,
            reach: metrics.reach?.reach || 0,
            profileVisits: metrics.reach?.profileVisits || 0,
            reelWatchTime: metrics.video?.watchTime || 0,
            analyticsUpdatedAt: new Date(),
          },
        });
      }

      await SystemLogger.logActivity({
        action: 'analytics_fetched',
        entity: 'post',
        entityId: input.postId,
        details: { platform: post.platform, context: 'fetchAnalyticsTool' },
      });

      return {
        success: true,
        metrics,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch analytics: ${error}`,
        source: 'postCreationTool',
        context: 'fetchAnalyticsTool',
      });
      return {
        success: false,
        error: `${error}`,
      };
    }
  },
});

/**
 * Helper Functions
 */

function extractHashtags(content: string): string[] {
  const matches = content.match(/#\w+/g) || [];
  return [...new Set(matches)].slice(0, 10);
}

function extractCTA(content: string): string | undefined {
  const ctaPatterns = [
    /(?:click|tap|visit|go to|check out|learn more).*?(?:\.|$)/i,
    /(?:shop|buy|order|get).*?(?:now|today|here)/i,
    /(?:sign up|subscribe|join|register).*?(?:today|now|here)?/i,
  ];

  for (const pattern of ctaPatterns) {
    const match = content.match(pattern);
    if (match) return match[0].trim();
  }

  return undefined;
}
