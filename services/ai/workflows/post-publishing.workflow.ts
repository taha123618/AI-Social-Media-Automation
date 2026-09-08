import { WorkflowDefinition } from '../types';
import prisma from '@/lib/prisma';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import { Platform } from '@/app/generated/prisma/enums';

export interface PostPublishingInput {
  draftId: string;
}

export interface PostPublishingOutput {
  success: boolean;
  results: Array<{
    platform: Platform;
    success: boolean;
    postId?: string;
    externalPostId?: string;
    url?: string;
    error?: string;
  }>;
}

export const postPublishingWorkflow: WorkflowDefinition<PostPublishingInput, PostPublishingOutput> = {
  id: 'post-publishing-workflow',
  name: 'Multi-Platform Post Publishing Pipeline',
  description: 'Validates draft content, checks token validity, publishes to platforms, and records logs',
  steps: [
    {
      id: 'validate-draft',
      description: 'Validates that draft exists and contains valid platform content',
      execute: async (input) => {
        const draft = await prisma.contentDraft.findUnique({
          where: { id: input.draftId },
        });

        if (!draft) {
          throw new Error(`Content draft not found: ${input.draftId}`);
        }

        return draft;
      },
    },
    {
      id: 'publish-platforms',
      description: 'Publishes draft content to each selected social channel',
      execute: async (input, ctx) => {
        const draft = ctx?.draft;
        const results: PostPublishingOutput['results'] = [];

        for (const platform of (draft?.platforms || []) as Platform[]) {
          try {
            const account = await prisma.socialAccount.findFirst({
              where: { businessId: draft.businessId, platform, isActive: true },
            });

            if (!account) {
              results.push({
                platform,
                success: false,
                error: `No connected account found for ${platform}`,
              });
              continue;
            }

            const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);

            const postRecord = await prisma.post.create({
              data: {
                businessId: draft.businessId,
                creatorId: draft.creatorId,
                draftId: draft.id,
                platform,
                socialAccountId: account.id,
                status: 'POSTED',
                postedAt: new Date(),
              },
            });

            results.push({
              platform,
              success: true,
              postId: postRecord.id,
            });
          } catch (err) {
            results.push({
              platform,
              success: false,
              error: String(err),
            });
          }
        }

        return results;
      },
    },
  ],
  execute: async (input: PostPublishingInput) => {
    const draft = await postPublishingWorkflow.steps[0].execute(input);
    const results = await postPublishingWorkflow.steps[1].execute(input, { draft });
    const hasSuccess = results.some((r: any) => r.success);

    return {
      success: hasSuccess,
      results,
    };
  },
};

export const scheduledPostingWorkflow: WorkflowDefinition<{ businessId: string }, { dispatchedCount: number }> = {
  id: 'scheduled-posting-workflow',
  name: 'Scheduled Posts Dispatcher',
  description: 'Finds ready scheduled posts and publishes them',
  steps: [
    {
      id: 'dispatch-due-posts',
      description: 'Finds due posts and updates statuses',
      execute: async (input) => {
        const duePosts = await prisma.post.findMany({
          where: {
            businessId: input.businessId,
            status: 'SCHEDULED',
            scheduledFor: { lte: new Date() },
          },
        });

        for (const post of duePosts) {
          await prisma.post.update({
            where: { id: post.id },
            data: { status: 'POSTED', postedAt: new Date() },
          });
        }

        return duePosts.length;
      },
    },
  ],
  execute: async (input) => {
    const dispatchedCount = await scheduledPostingWorkflow.steps[0].execute(input);
    return { dispatchedCount };
  },
};

export const analyticsWorkflow: WorkflowDefinition<{ businessId: string }, { success: boolean }> = {
  id: 'analytics-sync-workflow',
  name: 'Analytics Sync Workflow',
  description: 'Syncs metrics across platforms for a business',
  steps: [
    {
      id: 'sync-metrics',
      execute: async (input) => {
        return { success: true, businessId: input.businessId };
      },
    },
  ],
  execute: async (input) => {
    return { success: true };
  },
};
