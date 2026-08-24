import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import { Platform } from '@/app/generated/prisma/client';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * List Recent Engagement Tool
 * Fetches recent comments and direct messages
 */
export const listEngagementTool = createTool({
  id: 'list-engagement',
  description: 'List recent comments and direct messages across all connected social accounts for a business',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    limit: z.number().optional().default(5).describe('Number of items to fetch per category per account'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    comments: z.array(z.any()),
    directMessages: z.array(z.any()),
    message: z.string().optional(),
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
             // 1. Fetch recent media to get comments
             const response = await fetch(
               `https://graph.facebook.com/v19.0/${account.platformId}/media?fields=id,caption&limit=5&access_token=${accessToken}`
             );
             const mediaData = await response.json();
             
             if (mediaData.data) {
               for (const media of mediaData.data) {
                 const comments = await MetaBusinessManagerService.getComments(media.id, accessToken);
                 allComments.push(...comments.map(c => ({ ...c, platform: 'INSTAGRAM', accountId: account.id, mediaId: media.id, mediaCaption: media.caption })));
               }
             }

             // 2. Fetch DMs
             const conversations = await MetaBusinessManagerService.getInstagramConversations(account.platformId, accessToken);
             for (const conv of conversations.slice(0, input.limit)) {
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
          } else if (account.platform === Platform.FACEBOOK) {
            const response = await fetch(
              `https://graph.facebook.com/v19.0/${account.platformId}/feed?fields=id,message&limit=5&access_token=${accessToken}`
            );
            const feedData = await response.json();

            if (feedData.data) {
              for (const post of feedData.data) {
                const comments = await MetaBusinessManagerService.getComments(post.id, accessToken);
                allComments.push(...comments.map(c => ({ ...c, platform: 'FACEBOOK', accountId: account.id, postId: post.id, postMessage: post.message })));
              }
            }
          }
        } catch (accountError) {
          console.error(`Error fetching engagement for account ${account.id}:`, accountError);
        }
      }

      return {
        success: true,
        comments: allComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20),
        directMessages: allDMs.sort((a, b) => b.updatedTime.getTime() - a.updatedTime.getTime()).slice(0, 20),
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to list engagement: ${error}`,
        source: 'socialEngagementTool',
        context: 'listEngagementTool',
      });
      return {
        success: false,
        comments: [],
        directMessages: [],
        message: `${error}`,
      };
    }
  },
});

/**
 * Reply to Engagement Tool
 * Sends a reply to a comment or direct message
 */
export const replyEngagementTool = createTool({
  id: 'reply-engagement',
  description: 'Reply to a specific comment or send a direct message in a thread',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    type: z.enum(['COMMENT', 'DM']).describe('Type of engagement to reply to'),
    engagementId: z.string().describe('The ID of the comment to reply to, or the Instagram User ID (for DM) or Thread ID'),
    message: z.string().describe('The reply message content'),
    socialAccountId: z.string().describe('The social account ID to use for the reply'),
    recipientId: z.string().optional().describe('The recipient ID (required for new DMs)'),
    threadId: z.string().optional().describe('The thread ID (preferred for DMs if available)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    replyId: z.string().optional(),
    message: z.string(),
  }),
  execute: async (input) => {
    try {
      const account = await prisma.socialAccount.findUnique({
        where: { id: input.socialAccountId },
      });

      if (!account || account.businessId !== input.businessId) {
        throw new Error('Invalid social account');
      }

      const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);

      let replyId: string;

      if (input.type === 'COMMENT') {
        replyId = await MetaBusinessManagerService.publishComment(input.engagementId, accessToken, input.message);
      } else {
        // DM
        if (!input.recipientId && !input.threadId) {
          throw new Error('Recipient ID or Thread ID is required for DMs');
        }

        if (account.platform === Platform.INSTAGRAM) {
          if (input.recipientId) {
            replyId = await MetaBusinessManagerService.sendInstagramDirectMessage(account.platformId, input.recipientId, input.message, accessToken);
          } else {
            // If we only have threadId, we should ideally fetch the participant ID first
            // For now, let's assume recipientId is provided by the agent after listing conversations
            throw new Error('Recipient ID is required for Instagram DMs');
          }
        } else {
          throw new Error(`Direct messages not yet supported for ${account.platform}`);
        }
      }

      await SystemLogger.logActivity({
        action: 'engagement_reply_sent',
        entity: input.type === 'COMMENT' ? 'comment' : 'dm',
        entityId: replyId,
        details: { platform: account.platform, type: input.type, context: 'replyEngagementTool' },
      });

      return {
        success: true,
        replyId,
        message: 'Reply sent successfully',
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to send engagement reply: ${error}`,
        source: 'socialEngagementTool',
        context: 'replyEngagementTool',
      });
      return {
        success: false,
        message: `${error}`,
      };
    }
  },
});
