/**
 * Mastra Workflows for Social Media Posting
 * Orchestrates multi-step posting processes
 */

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import { ContentStatus, Platform } from '@/app/generated/prisma/client';

// ============================================================================
// Schemas
// ============================================================================

const draftValidationSchema = z.object({
  draftId: z.string(),
});

const draftDataSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  creatorId: z.string(),
  contentJson: z.any(),
  mediaUrl: z.string().nullable().optional(),
  platforms: z.array(z.nativeEnum(Platform)),
});

const publishResultSchema = z.object({
  success: z.boolean(),
  postId: z.string().optional(),
  externalPostId: z.string().optional(),
  url: z.string().optional(),
  error: z.string().optional(),
});

const workflowResultSchema = z.object({
  success: z.boolean(),
  results: z.array(publishResultSchema).optional(),
  error: z.string().optional(),
});

// ============================================================================
// Steps
// ============================================================================

const validateContent = createStep({
  id: 'validate-content',
  description: 'Validates that the content draft exists and has required content',
  inputSchema: draftValidationSchema,
  outputSchema: z.object({
    draft: draftDataSchema,
  }),
  execute: async ({ inputData }) => {
    if (!inputData?.draftId) {
      throw new Error('Draft ID is required');
    }

    const draft = await prisma.contentDraft.findUnique({
      where: { id: inputData.draftId },
    });

    if (!draft) {
      throw new Error('Draft not found');
    }

    if (!draft.contentJson || !(draft.contentJson as any).text) {
      throw new Error('No content to publish');
    }

    return { draft };
  },
});

const publishToFacebook = createStep({
  id: 'publish-to-facebook',
  description: 'Publishes content to Facebook if Facebook is selected in platforms',
  inputSchema: z.object({
    draft: draftDataSchema,
  }),
  outputSchema: z.object({
    draft: draftDataSchema,
    facebookResult: publishResultSchema,
  }),
  execute: async ({ inputData }) => {
    const { draft } = inputData;

    if (!draft.platforms.includes(Platform.FACEBOOK)) {
      return { draft, facebookResult: { success: true } }; // Skip if Facebook not selected
    }

    try {
      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          businessId: draft.businessId,
          platform: Platform.FACEBOOK,
          isActive: true,
        },
      });

      if (!socialAccount) {
        throw new Error('No Facebook account configured');
      }

      const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(
        socialAccount
      );

      const result = await MetaBusinessManagerService.publishToFacebook(
        socialAccount.platformId,
        accessToken,
        draft.contentJson,
        draft.mediaUrl ? [draft.mediaUrl] : undefined
      );

      // Create Post record
      const post = await prisma.post.create({
        data: {
          businessId: draft.businessId,
          creatorId: draft.creatorId,
          draftId: draft.id,
          platform: Platform.FACEBOOK,
          externalPostId: result.postId,
          socialAccountId: socialAccount.id,
          publishedUrl: result.url,
          postedAt: new Date(),
        },
      });

      // PostAnalytics are now flattened into Post model

      return {
        draft,
        facebookResult: {
          success: true,
          postId: post.id,
          externalPostId: result.postId,
          url: result.url,
        },
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Facebook publishing failed: ${error}`,
        source: 'postPublishingWorkflow',
        context: 'postPublishingWorkflow.publishToFacebook',
      });
      return { draft, facebookResult: { success: false, error: `${error}` } };
    }
  },
});

const publishToInstagram = createStep({
  id: 'publish-to-instagram',
  description: 'Publishes content to Instagram if Instagram is selected in platforms',
  inputSchema: z.object({
    draft: draftDataSchema,
    facebookResult: publishResultSchema,
  }),
  outputSchema: z.object({
    draft: draftDataSchema,
    facebookResult: publishResultSchema,
    instagramResult: publishResultSchema,
  }),
  execute: async ({ inputData }) => {
    const { draft, facebookResult } = inputData;

    if (!draft.platforms.includes(Platform.INSTAGRAM)) {
      return { draft, facebookResult, instagramResult: { success: true } }; // Skip if Instagram not selected
    }

    try {
      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          businessId: draft.businessId,
          platform: Platform.INSTAGRAM,
          isActive: true,
        },
      });

      if (!socialAccount || !socialAccount.platformId) {
        throw new Error('No Instagram account configured');
      }

      const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(
        socialAccount
      );

      const containerResult = await MetaBusinessManagerService.publishToInstagram(
        socialAccount.platformId,
        accessToken,
        draft.contentJson,
        draft.mediaUrl ? [draft.mediaUrl] : undefined
      );

      // Create Post record
      const post = await prisma.post.create({
        data: {
          businessId: draft.businessId,
          creatorId: draft.creatorId,
          draftId: draft.id,
          platform: Platform.INSTAGRAM,
          externalPostId: containerResult.containerIds[0],
          socialAccountId: socialAccount.id,
          publishedUrl: `https://instagram.com`,
          postedAt: new Date(),
        },
      });

      // PostAnalytics are now flattened into Post model

      return {
        draft,
        facebookResult,
        instagramResult: {
          success: true,
          postId: post.id,
          externalPostId: containerResult.containerIds[0],
        },
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Instagram publishing failed: ${error}`,
        source: 'postPublishingWorkflow',
        context: 'postPublishingWorkflow.publishToInstagram',
      });
      return { draft, facebookResult, instagramResult: { success: false, error: `${error}` } };
    }
  },
});

const updateDraftStatus = createStep({
  id: 'update-draft-status',
  description: 'Updates the draft status to POSTED if publishing was successful',
  inputSchema: z.object({
    draft: draftDataSchema,
    facebookResult: publishResultSchema,
    instagramResult: publishResultSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    const { draft, facebookResult, instagramResult } = inputData;

    const hasSuccess = facebookResult?.success || instagramResult?.success;

    if (hasSuccess) {
      await prisma.contentDraft.update({
        where: { id: draft.id },
        data: {
          status: ContentStatus.POSTED,
          postedAt: new Date(),
        },
      });
    }

    return { success: true };
  },
});

// ============================================================================
// Post Publishing Workflow
// ============================================================================

export const postPublishingWorkflow = createWorkflow({
  id: 'post-publishing-workflow',
  inputSchema: draftValidationSchema,
  outputSchema: z.object({
    success: z.boolean(),
  }),
})
  .then(validateContent)
  .then(publishToFacebook)
  .then(publishToInstagram)
  .then(updateDraftStatus);

postPublishingWorkflow.commit();

// ============================================================================
// Analytics Workflow Schemas and Steps
// ============================================================================

const analyticsResultSchema = z.object({
  successful: z.number(),
  failed: z.number(),
});

const getPostsForAnalytics = createStep({
  id: 'get-posts-for-analytics',
  description: 'Gets published posts that need analytics updates',
  inputSchema: z.object({}),
  outputSchema: z.object({
    posts: z.array(z.any()),
  }),
  execute: async () => {
    const posts = await prisma.post.findMany({
      where: {
        postedAt: { not: null },
        analyticsUpdatedAt: {
          lt: new Date(Date.now() - 3600000), // Older than 1 hour
        },
      },
      include: {
        socialAccount: true,
      },
      take: 100, // Limit to 100 posts per run
    });

    return { posts };
  },
});

const fetchFacebookAnalytics = createStep({
  id: 'fetch-facebook-analytics',
  description: 'Fetches analytics for Facebook posts',
  inputSchema: z.object({
    posts: z.array(z.any()),
  }),
  outputSchema: z.object({
    posts: z.array(z.any()),
    facebookResults: z.array(z.object({
      postId: z.string(),
      success: z.boolean(),
      error: z.string().optional(),
    })),
  }),
  execute: async ({ inputData }) => {
    const { posts } = inputData;
    const facebookPosts = posts.filter((p: any) => p.platform === Platform.FACEBOOK);

    const results: any[] = [];

    for (const post of facebookPosts) {
      try {
        const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(
          post.socialAccount
        );

        const metrics = await MetaBusinessManagerService.getFacebookPostInsights(
          post.externalPostId,
          accessToken
        );

        await prisma.post.update({
          where: { id: post.id },
          data: {
            likes: metrics.engagement?.likes || 0,
            comments: metrics.engagement?.comments || 0,
            shares: metrics.engagement?.shares || 0,
            impressions: metrics.reach?.impressions || 0,
            analyticsUpdatedAt: new Date(),
          },
        });

        results.push({ postId: post.id, success: true });
      } catch (error) {
        results.push({ postId: post.id, success: false, error: `${error}` });
      }
    }

    return { posts, facebookResults: results };
  },
});

const fetchInstagramAnalytics = createStep({
  id: 'fetch-instagram-analytics',
  description: 'Fetches analytics for Instagram posts',
  inputSchema: z.object({
    posts: z.array(z.any()),
    facebookResults: z.array(z.any()),
  }),
  outputSchema: z.object({
    facebookResults: z.array(z.any()),
    instagramResults: z.array(z.object({
      postId: z.string(),
      success: z.boolean(),
      error: z.string().optional(),
    })),
  }),
  execute: async ({ inputData }) => {
    const { posts, facebookResults } = inputData;
    const instagramPosts = posts.filter((p: any) => p.platform === Platform.INSTAGRAM);

    const results: any[] = [];

    for (const post of instagramPosts) {
      try {
        const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(
          post.socialAccount
        );

        const metrics = await MetaBusinessManagerService.getInstagramMediaInsights(
          post.externalPostId,
          accessToken
        );

        await prisma.post.update({
          where: { id: post.id },
          data: {
            likes: metrics.engagement?.likes || 0,
            comments: metrics.engagement?.comments || 0,
            saves: metrics.engagement?.saves || 0,
            impressions: metrics.reach?.impressions || 0,
            analyticsUpdatedAt: new Date(),
          },
        });

        results.push({ postId: post.id, success: true });
      } catch (error) {
        results.push({ postId: post.id, success: false, error: `${error}` });
      }
    }

    return { facebookResults, instagramResults: results };
  },
});

const logAnalyticsResults = createStep({
  id: 'log-analytics-results',
  description: 'Logs the results of analytics fetching',
  inputSchema: z.object({
    facebookResults: z.array(z.any()),
    instagramResults: z.array(z.any()),
  }),
  outputSchema: analyticsResultSchema,
  execute: async ({ inputData }) => {
    const { facebookResults, instagramResults } = inputData;

    const successful = [
      ...facebookResults.filter((r: any) => r.success),
      ...instagramResults.filter((r: any) => r.success),
    ].length;

    const failed = [
      ...facebookResults.filter((r: any) => !r.success),
      ...instagramResults.filter((r: any) => !r.success),
    ].length;

    await SystemLogger.logInfo({
      message: `Analytics sync completed`,
      context: {
        source: 'analyticsWorkflow',
        successful,
        failed,
      },
    });

    return { successful, failed };
  },
});

// ============================================================================
// Analytics Fetching Workflow (Scheduled)
// ============================================================================

export const analyticsWorkflow = createWorkflow({
  id: 'analytics-workflow',
  inputSchema: z.object({}),
  outputSchema: analyticsResultSchema,
})
  .then(getPostsForAnalytics)
  .then(fetchFacebookAnalytics)
  .then(fetchInstagramAnalytics)
  .then(logAnalyticsResults);

analyticsWorkflow.commit();

// ============================================================================
// Scheduled Posting Workflow Schemas and Steps
// ============================================================================

const findScheduledPosts = createStep({
  id: 'find-scheduled-posts',
  description: 'Finds content drafts that are scheduled for publishing',
  inputSchema: z.object({}),
  outputSchema: z.object({
    posts: z.array(z.any()),
  }),
  execute: async () => {
    const now = new Date();
    const posts = await prisma.contentDraft.findMany({
      where: {
        status: ContentStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        posts: true,
      },
      take: 25,
    });

    return { posts };
  },
});

const publishScheduledPosts = createStep({
  id: 'publish-scheduled-posts',
  description: 'Publishes all scheduled posts',
  inputSchema: z.object({
    posts: z.array(z.any()),
  }),
  outputSchema: z.object({
    published: z.number(),
    results: z.array(z.object({
      draftId: z.string(),
      success: z.boolean(),
    })),
  }),
  execute: async ({ inputData }) => {
    const { posts } = inputData;
    const results: any[] = [];

    for (const draft of posts) {
      // Trigger publishing workflow for each draft
      const result = (await postPublishingWorkflow.execute({
        triggerData: { draftId: draft.id },
      } as any)) as any;

      const success = result?.results?.['update-draft-status']?.payload?.success || false;

      results.push({
        draftId: draft.id,
        success,
      });
    }

    return { published: results.length, results };
  },
});

// ============================================================================
// Scheduled Post Publishing Workflow
// ============================================================================

export const scheduledPostingWorkflow = createWorkflow({
  id: 'scheduled-posting-workflow',
  inputSchema: z.object({}),
  outputSchema: z.object({
    published: z.number(),
    results: z.array(z.object({
      draftId: z.string(),
      success: z.boolean(),
    })),
  }),
})
  .then(findScheduledPosts)
  .then(publishScheduledPosts);

scheduledPostingWorkflow.commit();
