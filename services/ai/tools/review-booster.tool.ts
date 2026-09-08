import { z } from 'zod';
import { ToolDefinition } from '../types';
import { sendReviewRequest } from '@/features/organization/services/review-request.service';
import { generateReviewResponse } from '@/features/organization/services/review-response-generator.service';
import { convertReviewToPostDraft } from '@/features/organization/services/review-to-post-converter.service';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * Review Request Tool
 */
export const requestReviewTool: ToolDefinition<
  {
    businessId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    channel?: 'EMAIL' | 'SMS';
    message?: string;
  },
  {
    success: boolean;
    requestId?: string;
    message: string;
  }
> = {
  id: 'request-review',
  name: 'Review Requester',
  description: 'Send a review request to a customer via email or SMS',
  inputSchema: z.object({
    businessId: z.string().describe('The ID of the business'),
    customerName: z.string().describe('Name of the customer'),
    customerEmail: z.string().describe('Customer email address'),
    customerPhone: z.string().optional().describe('Customer phone number'),
    channel: z.enum(['EMAIL', 'SMS']).default('EMAIL'),
    message: z.string().optional().describe('Personalized message for the request'),
  }),
  execute: async (input) => {
    try {
      const result = await sendReviewRequest({
        businessId: input.businessId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        channel: input.channel || 'EMAIL',
        message: input.message,
      });

      return {
        success: true,
        requestId: result.requestId,
        message: result.message,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to send review request: ${error}`,
        source: 'reviewBoosterTool',
        context: 'requestReviewTool',
      });
      return { success: false, message: `${error}` };
    }
  },
};

/**
 * AI Review Reply Tool
 */
export const generateReviewReplyTool: ToolDefinition<
  {
    reviewId: string;
    businessId: string;
  },
  {
    success: boolean;
    replyText?: string;
    suggestedActions?: string[];
  }
> = {
  id: 'generate-review-reply',
  name: 'AI Review Reply Generator',
  description: 'Generate an AI response to a customer review',
  inputSchema: z.object({
    reviewId: z.string().describe('The ID of the review to reply to'),
    businessId: z.string().describe('The ID of the business'),
  }),
  execute: async (input) => {
    try {
      const result = await generateReviewResponse({
        reviewId: input.reviewId,
        businessId: input.businessId,
      });
      return {
        success: true,
        replyText: result.responseText,
        suggestedActions: result.suggestedActions,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to generate review reply: ${error}`,
        source: 'reviewBoosterTool',
        context: 'generateReviewReplyTool',
      });
      return { success: false };
    }
  },
};

/**
 * Review to Social Post Tool
 */
export const reviewToSocialPostTool: ToolDefinition<
  {
    reviewId: string;
    businessId: string;
    platforms?: string[];
  },
  {
    success: boolean;
    postContent?: any;
  }
> = {
  id: 'convert-review-to-post',
  name: 'Review Testimonial Converter',
  description: 'Convert a 5-star review into a social media post',
  inputSchema: z.object({
    reviewId: z.string().describe('The ID of the review'),
    businessId: z.string().describe('The ID of the business'),
    platforms: z.array(z.string()).optional().default(['INSTAGRAM', 'FACEBOOK']),
  }),
  execute: async (input) => {
    try {
      const result = await convertReviewToPostDraft({
        reviewId: input.reviewId,
        businessId: input.businessId,
        platforms: (input.platforms as any) || ['INSTAGRAM', 'FACEBOOK'],
      });
      return {
        success: true,
        postContent: result,
      };
    } catch (error) {
      await SystemLogger.logError({
        message: `Failed to convert review to post: ${error}`,
        source: 'reviewBoosterTool',
        context: 'reviewToSocialPostTool',
      });
      return { success: false };
    }
  },
};
