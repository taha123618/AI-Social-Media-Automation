import { z } from 'zod';
import { ToolDefinition } from '../types';
import prisma from '@/lib/prisma';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import { Platform } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * List Recent Engagement Tool
 * Fetches recent comments and direct messages
 */
export const listEngagementTool: ToolDefinition<
  {
    businessId: string;
    limit?: number;
  },
  {
    success: boolean;
    comments: any[];
    directMessages: any[];
    message?: string;
  }
> = {
  id: 'list-engagement',
  name: 'Social Engagement Stream',
  description: 'List recent comments and direct messages across all connected social accounts for a business',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    limit: z.number().optional().default(5).describe('Number of items to fetch per category per account'),
  }),
  execute: async (input) => {
    try {
      const accounts = await prisma.socialAccount.findMany({
        where: { businessId: input.businessId, isActive: true },
      });

      const allComments: any[] = [];
      const allDMs: any[] = [];

      for (const account of accounts) {
        try {
          const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);

          if (account.platform === Platform.INSTAGRAM) {
            const response = await fetch(
              `https://graph.facebook.com/v19.0/${account.platformId}/media?fields=id,caption&limit=5&access_token=${accessToken}`
            );
            const mediaData = await response.json();

            if (mediaData.data) {
              for (const media of mediaData.data) {
                const comments = await MetaBusinessManagerService.getComments(media.id, accessToken);
                allComments.push(
                  ...comments.map((c) => ({
                    ...c,
                    platform: 'INSTAGRAM',
                    accountId: account.id,
                    mediaId: media.id,
                    mediaCaption: media.caption,
                  }))
                );
              }
            }

            const conversations = await MetaBusinessManagerService.getInstagramConversations(account.platformId || '', accessToken);
            for (const conv of conversations.slice(0, input.limit || 5)) {
              const messages = await MetaBusinessManagerService.getConversationMessages(conv.id, accessToken);
              allDMs.push({
                threadId: conv.id,
                platform: 'INSTAGRAM',
                accountId: account.id,
                participants: conv.participants,
                lastMessages: messages.slice(0, 3),
                updatedTime: conv.updatedTime,
              });
            }
          }
        } catch (accountError) {
          console.error(`Error processing engagement for account ${account.id}:`, accountError);
        }
      }

      return {
        success: true,
        comments: allComments,
        directMessages: allDMs,
        message: `Fetched ${allComments.length} comments and ${allDMs.length} conversation threads.`,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to fetch engagement: ${error}`,
        source: 'socialEngagementTool',
        context: 'listEngagementTool',
      });
      throw new Error(`Failed to fetch engagement: ${error}`);
    }
  },
};

/**
 * Reply to Comment Tool
 */
export const replyToCommentTool: ToolDefinition<
  {
    commentId: string;
    accountId: string;
    message: string;
  },
  {
    success: boolean;
    result?: any;
    message?: string;
  }
> = {
  id: 'reply-to-comment',
  name: 'Social Comment Replier',
  description: 'Reply to a comment on Instagram or Facebook',
  inputSchema: z.object({
    commentId: z.string().describe('The ID of the comment to reply to'),
    accountId: z.string().describe('The ID of the social account'),
    message: z.string().describe('The reply message content'),
  }),
  execute: async (input) => {
    try {
      const account = await prisma.socialAccount.findUnique({
        where: { id: input.accountId },
      });

      if (!account) {
        throw new Error(`Social account not found: ${input.accountId}`);
      }

      const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);
      const result = await MetaBusinessManagerService.publishComment(input.commentId, input.message, accessToken);

      return {
        success: true,
        result,
        message: 'Successfully replied to comment.',
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to reply to comment: ${error}`,
        source: 'socialEngagementTool',
        context: 'replyToCommentTool',
      });
      throw new Error(`Failed to reply to comment: ${error}`);
    }
  },
};
