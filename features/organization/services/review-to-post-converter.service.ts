import prisma from '@/lib/prisma';
import { AIService } from "@/services/ai/ai.service";
import { ContentIntent, Platform } from '@/app/generated/prisma/enums';
import { SystemLogger } from "@/features/system/services/logger.service";

export interface ReviewToPostInput {
  reviewId: string;
  businessId: string;
  platforms?: Platform[];
  creatorId?: string; // Optional: used for ContentDraft creation
}

export interface GeneratedSocialPost {
  caption: string;
  hashtags: string[];
  cta: string;
  suggestedMedia: string[];
  platforms: Platform[];
  intent: ContentIntent;
}

interface ReviewWithBusiness {
  id: string;
  rating: number;
  reviewText: string | null;
  reviewerName: string | null;
  business: {
    id: string;
    name: string;
    profile: {
      industry: string | null;
      tone: string | null;
      mission: string | null;
    } | null;
    members: {
      userId: string;
    }[];
  };
}

/**
 * Convert positive reviews into engaging social media posts
 */
export async function convertReviewToPostDraft(
  input: ReviewToPostInput
): Promise<GeneratedSocialPost> {
  const { reviewId, businessId, platforms = [Platform.INSTAGRAM, Platform.FACEBOOK] } = input;

  await SystemLogger.logActivity({
    action: "REVIEW_CONVERSION_STARTED",
    entity: "Review",
    entityId: reviewId,
    details: { businessId, platforms }
  });

  try {
    // Get review with business details
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        business: {
          include: {
            profile: true,
            members: {
              take: 1
            }
          }
        }
      }
    }) as ReviewWithBusiness | null;

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.rating < 4) {
      throw new Error('Only positive reviews (4+ stars) can be converted to posts');
    }

    const customerName = review.reviewerName || 'A happy customer';
    const businessName = review.business.name;
    const reviewText = review.reviewText || 'Excellent service!';
    const industry = review.business.profile?.industry || 'Business';
    const tone = review.business.profile?.tone || 'Professional';

    const systemPrompt = `
You are a social media expert. Your job is to transform a customer review into a high-engaging social media post.
The goal is to showcase trust and social proof.

--- BUSINESS IDENTITY ---
Name: ${businessName}
Industry: ${industry}
Tone: ${tone}

--- GUIDELINES ---
1. Write an engaging caption that highlights the customer's positive experience.
2. Optimize for the following platforms: ${platforms.join(', ')}.
3. Use emojis naturally.
4. Include a strong Call to Action (CTA).
5. Generate 5-10 relevant hashtags.
6. NO CLICHÉS: Avoid "We are so proud" or "Check out this review". Make it feel alive.

--- OUTPUT FORMAT ---
You MUST output ONLY a valid JSON object. Do not include any conversational text, headers, or footers.
{
  "caption": "Post caption here",
  "hashtags": ["#tag1", "#tag2"],
  "cta": "The call to action text",
  "suggestedMedia": ["business-logo", "lifestyle-photo"]
}
    `.trim();

    const userPrompt = `
Customer: ${customerName}
Review: "${reviewText}"
Rating: ${review.rating}/5

Generate the JSON now:
    `.trim();

    const aiResponse = await AIService.generateJSON<any>({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
    });

    const result: GeneratedSocialPost = {
      caption: aiResponse.caption,
      hashtags: aiResponse.hashtags,
      cta: aiResponse.cta,
      suggestedMedia: aiResponse.suggestedMedia || [],
      platforms,
      intent: ContentIntent.BRAND_AWARENESS
    };

    // Save as ContentDraft
    const creatorId = input.creatorId || review.business.members[0]?.userId;

    if (creatorId) {
      await prisma.contentDraft.create({
        data: {
          businessId,
          creatorId,
          intent: ContentIntent.BRAND_AWARENESS,
          platforms,
          contentJson: result as any,
          visualPrompt: `Professional social media graphic for ${businessName} featuring a testimonial from ${customerName}. Style: ${tone}, High quality.`,
          status: "GENERATED"
        }
      });

      // Mark review as converted
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          convertedToPost: true
        }
      });
    }

    await SystemLogger.logActivity({
      action: "REVIEW_CONVERSION_COMPLETED",
      entity: "Review",
      entityId: reviewId,
      details: { businessId, draftCreated: !!creatorId }
    });

    return result;
  } catch (error: any) {
    console.error('Failed to convert review to post:', error);
    await SystemLogger.logError({
      message: error.message || "Review conversion failed",
      source: "ReviewToPostConverterService.convertReviewToPostDraft",
      context: { reviewId, businessId }
    });
    throw error;
  }
}

/**
 * Bulk convert reviews
 */
export async function bulkConvertReviewsToPosts(
  reviewIds: string[],
  businessId: string,
  creatorId?: string
) {
  const results = [];

  for (const reviewId of reviewIds) {
    try {
      const post = await convertReviewToPostDraft({
        reviewId,
        businessId,
        creatorId
      });

      results.push({
        reviewId,
        success: true,
        post
      });
    } catch (error) {
      console.error(`Failed to convert review ${reviewId}:`, error);
      results.push({ reviewId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return results;
}
