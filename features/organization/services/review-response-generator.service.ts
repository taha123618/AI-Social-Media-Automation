import prisma from '@/lib/prisma';
import { AIService } from "@/services/ai/ai.service";
import { SystemLogger } from "@/features/system/services/logger.service";

interface ReviewWithBusiness {
  id: string;
  rating: number;
  reviewText: string | null;
  reviewerName: string | null;
  businessId: string;
  business: {
    id: string;
    name: string;
    profile: {
      businessId: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      mission: string | null;
      vision: string | null;
      uvp: string | null;
      targetAudience: string | null;
      tone: string | null;
      industry: string | null;
      autoRequestReviews: boolean;
    } | null;
  };
}

export interface ReviewResponseInput {
  reviewId: string;
  businessId: string;
}

export interface GeneratedReviewResponse {
  responseText: string;
  tone: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedActions: string[];
}

/**
 * Generate AI-powered response to customer reviews
 */
export async function generateReviewResponse(
  input: ReviewResponseInput
): Promise<GeneratedReviewResponse> {
  const { reviewId, businessId } = input;

  try {
    // Get review details with business info
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        business: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Prepare context for AI
    const customerName = review.reviewerName || 'Valued Customer';
    const businessName = review.business.name;
    const rating = review.rating;
    const reviewText = review.reviewText || 'No text provided';
    const businessProfile = review.business.profile;

    const systemPrompt = `
You are a customer success manager for ${businessName}.
Your goal is to write a personalized, authentic, and professional response to a customer review.

--- BUSINESS CONTEXT ---
Industry: ${businessProfile?.industry || 'Not specified'}
Tone: ${businessProfile?.tone || 'Professional'}
Mission: ${businessProfile?.mission || 'To provide excellent service'}
UVP: ${businessProfile?.uvp || 'Quality and customer satisfaction'}

--- RESPONSE GUIDELINES ---
1. Be personal (address the customer by name if provided).
2. For 4-5 star reviews: Be thankful, enthusiastic, and invite them back.
3. For 3 star reviews: Be professional, acknowledge the feedback, and express a desire to improve.
4. For 1-2 star reviews: Be apologetic, empathetic, and offer a way to resolve the issue privately.
5. NO CLICHÉS: Avoid "Thank you for your feedback" as the only opening. Be creative and warm.
6. Keep it concise (2-4 sentences).

Output ONLY the response text. No labels or extra text.
    `.trim();

    const userPrompt = `
Customer Name: ${customerName}
Rating: ${rating}/5
Review: "${reviewText}"

Generate the response now:
    `.trim();

    // Call AI using AIService
    const aiResponse = await AIService.generateCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    const responseText = aiResponse.content.trim();

    // Sentiment and actions can still be derived or expanded by AI later
    const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
    const suggestedActions = suggestActions(review, sentiment);

    await SystemLogger.logActivity({
      action: "REVIEW_RESPONSE_GENERATED",
      entity: "Review",
      entityId: reviewId,
      details: { businessId, sentiment }
    });

    return {
      responseText,
      tone: businessProfile?.tone || 'Professional',
      sentiment,
      suggestedActions
    };
  } catch (error: any) {
    console.error('Failed to generate review response:', error);
    await SystemLogger.logError({
      message: error.message || "Failed to generate review response",
      source: "ReviewResponseGenerator.generateReviewResponse",
      context: { reviewId, businessId }
    });
    throw error;
  }
}

/**
 * Suggest follow-up actions based on review
 */
function suggestActions(
  review: ReviewWithBusiness,
  sentiment: 'positive' | 'neutral' | 'negative'
): string[] {
  const actions: string[] = [];

  if (sentiment === 'positive') {
    if (review.rating === 5) {
      actions.push('Ask for social media share');
      actions.push('Feature in newsletter');
    }
    actions.push('Send loyalty discount');
  } else if (sentiment === 'negative') {
    actions.push('Manager reach out');
    actions.push('Internal feedback report');
    actions.push('Offer service recovery refund/credit');
  } else {
    actions.push('Clarify specific pain points');
  }

  return actions;
}

/**
 * Bulk generate responses for multiple reviews
 */
export async function bulkGenerateResponses(reviewIds: string[]) {
  const results = [];

  for (const reviewId of reviewIds) {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { business: true }
      });

      if (review) {
        const response = await generateReviewResponse({
          reviewId,
          businessId: review.businessId
        });

        // Save response to database
        await prisma.review.update({
          where: { id: reviewId },
          data: {
            responseText: response.responseText,
            respondedAt: new Date()
          }
        });

        results.push({ reviewId, success: true, response });
      }
    } catch (error) {
      console.error(`Failed to generate response for review ${reviewId}:`, error);
      results.push({ reviewId, success: false, error });
    }
  }

  return results;
}

import { emailQueue } from '@/lib/emailQueue';

/**
 * Send the owner's response to the customer via email
 */
export async function sendOwnerResponse(input: { reviewId: string; businessId: string }) {
  const { reviewId, businessId } = input;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        business: true
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (!review.reviewerEmail) {
      throw new Error('Customer email not available for this review');
    }

    if (!review.responseText) {
      throw new Error('No response text generated for this review yet');
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9fafb; border-radius: 12px; padding: 30px; }
    .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #1a1a1a; }
    .message { font-size: 16px; margin-bottom: 30px; color: #444; background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; white-space: pre-wrap; }
    .footer { margin-top: 30px; font-size: 14px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">New response to your review for ${review.business.name}</div>
    <p>Hi ${review.reviewerName || 'there'},</p>
    <p>The owner of <strong>${review.business.name}</strong> has replied to your review:</p>
    <div class="message">${review.responseText}</div>
    <div class="footer">
      Thank you for being a valued customer!<br>
      The ${review.business.name} Team
    </div>
  </div>
</body>
</html>
    `.trim();

    await emailQueue.add('send-email', {
      to: review.reviewerEmail,
      subject: `Response to your review of ${review.business.name}`,
      html,
      type: 'review-response'
    });

    await SystemLogger.logActivity({
      action: "REVIEW_RESPONSE_SENT",
      entity: "Review",
      entityId: reviewId,
      details: { businessId, reviewerEmail: review.reviewerEmail }
    });

    return { success: true, message: 'Response sent to customer successfully' };
  } catch (error: any) {
    console.error('Failed to send owner response:', error);
    await SystemLogger.logError({
      message: error.message || "Failed to send owner response",
      source: "ReviewResponseGenerator.sendOwnerResponse",
      context: { reviewId, businessId }
    });
    throw error;
  }
}

