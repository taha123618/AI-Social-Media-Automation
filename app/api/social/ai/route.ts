// import { mastra } from '@/mastra';
import { ImageService } from '@/features/image_generation/services/image.service';
import { AnalyticsService } from '@/features/social/services/analytics.service';
import { AIService } from '@/services/ai/ai.service';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const PLATFORM_FORMATTING_RULES: Record<string, string> = {
  INSTAGRAM: 'Use emojis, line breaks, 20-30 relevant hashtags at end, visual storytelling, hook in first line',
  LINKEDIN: 'Professional tone, no hashtags in body (3-5 at end only), thought leadership angle, 150-300 words',
  TIKTOK: 'Hook in first 3 words, Gen-Z friendly language, 3-5 trending hashtags, 50-100 words max',
  GOOGLE_BUSINESS: 'Local SEO keywords, clear CTA with phone/location, service + city mention, 150-300 words',
  FACEBOOK: 'Conversational and relatable, 1-3 hashtags max, encourage comments/shares, slightly longer is ok',
  SNAPCHAT: 'Ultra casual, 1-2 sentences only, FOMO-driven, emoji heavy',
  THREADS: 'Conversational, short takes, debate-worthy opinions, 150 chars ideal, minimal hashtags',
  TWITTER: 'Under 280 chars, punchy and direct, 1-2 hashtags max, hook-first',
};

async function getImageUrlAsBase64(url: string): Promise<string> {
  if (url.startsWith('pending://')) {
    const image = await prisma.imageStorage.findFirst({
      where: { url }
    });
    if (image && image.data) {
      const base64Data = Buffer.from(image.data).toString('base64');
      return `data:${image.mimeType};base64,${base64Data}`;
    }
  }

  if (url.startsWith('data:')) {
    return url;
  }

  try {
    const response = await fetch(url);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      return `data:${mimeType};base64,${base64Data}`;
    }
  } catch (err) {
    console.error('[Base64 Conversion Error] Failed to fetch external url, passing as-is:', err);
  }

  return url;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Verify the user has access to this business
    const businessMember = await prisma.businessMember.findUnique({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId: businessId
        }
      }
    });

    if (!businessMember) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this business' },
        { status: 403 }
      );
    }

    const { action, input } = await req.json();

    if (action === 'generate-content') {
      let content: string;
      const platform = input.platform as string | undefined;

      const platformRule = platform ? PLATFORM_FORMATTING_RULES[platform] : null;
      const platformPrefix = platformRule
        ? `Target platform: ${platform}. Formatting rules: ${platformRule}\n\n`
        : '';

      if (input.imageUrl) {
        try {
          const base64Url = await getImageUrlAsBase64(input.imageUrl);
          const promptText = platformPrefix + (input.prompt || `Analyze this image and generate an extremely engaging, premium, and human-like social media caption. Suggest a promotional offer and clear Call-to-Action (CTA) if appropriate, and include 5-10 highly contextual hashtags.`);

          const response = await AIService.generateCompletion({
            model: input.model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: promptText },
                  { type: "image_url", image_url: { url: base64Url } }
                ]
              }
            ],
            temperature: input.temperature || 0.7,
            maxTokens: input.maxTokens || 1200
          });
          content = response.content;
        } catch (visionError: any) {
          console.error('[Vision API Error, falling back to text]:', visionError);
          content = await AIService.generateWithOpenRouter({
            prompt: input.prompt,
            model: input.model,
            maxTokens: input.maxTokens || 1000,
            temperature: input.temperature || 0.7
          });
        }
      } else {
        content = await AIService.generateWithOpenRouter({
          prompt: (platformPrefix + (input.prompt || '')),
          model: input.model,
          maxTokens: input.maxTokens || 1000,
          temperature: input.temperature || 0.7
        });
      }

      return NextResponse.json({
        success: true,
        text: content,
        threadId: input.threadId || 'social-posting'
      });
    }

    if (action === 'refine-content') {
      // Direct AIService approach for content refinement
      try {
        // Handle different refinement actions with specific prompts
        const getRefinementPrompt = (action: string, content: string) => {
          switch (action.toLowerCase()) {
            case 'shorten':
              return `Please make this content more concise and to the point while keeping the main message:\n\n${content}\n\nReturn only the shortened content without any additional text.`;
            case 'expand':
              return `Please expand this content with more details, examples, and context while maintaining the original tone:\n\n${content}\n\nReturn only the expanded content without any additional text.`;
            case 'make more formal':
              return `Please rewrite this content in a more professional and formal tone:\n\n${content}\n\nReturn only the formal version without any additional text.`;
            case 'make more casual':
              return `Please rewrite this content in a more casual and conversational tone:\n\n${content}\n\nReturn only the casual version without any additional text.`;
            case 'improve':
              return `Please improve this content by making it more engaging, clear, and impactful:\n\n${content}\n\nReturn only the improved content without any additional text.`;
            default:
              return `Please ${action} the following content:\n\n${content}\n\nReturn only the improved content without any additional text.`;
          }
        };

        const refinementPrompt = getRefinementPrompt(input.refinement, input.content);

        const refinedContent = await AIService.generateWithOpenRouter({
          prompt: refinementPrompt,
          maxTokens: 1500,
          temperature: 0.7
        });

        return NextResponse.json({
          success: true,
          text: refinedContent
        });
      } catch (error: any) {
        console.error('[Content Refinement Error]:', error);
        return NextResponse.json({
          success: false,
          error: error.message || 'Content refinement failed'
        }, { status: 500 });
      }
    }

    if (action === 'generate-image') {
      // Mastra approach - commented out
      // const tool = mastra.getTool('generate-post-image');
      // const result = await tool.execute(input);
      // return NextResponse.json({ success: true, ...result });

      // Direct ImageService approach
      try {
        // Map frontend 'size' parameter to 'aspectRatio'
        const sizeToAspectRatio = (size: string) => {
          switch (size) {
            case 'square': return '1:1';
            case 'landscape': return '16:9';
            case 'portrait': return '9:16';
            default: return '1:1';
          }
        };

        // Prepare image generation request
        const imageRequest = {
          businessId: businessId, // Use the actual business ID from headers
          userId: session.user.id, // Use the actual user ID from session
          prompt: input.prompt || 'Professional business image',
          aspectRatio: input.aspectRatio || sizeToAspectRatio(input.size) || '1:1',
          quality: input.quality || 'standard',
          model: input.model || 'runway-gen4-image',
          style: input.style || 'realistic',
          variations: input.variations || 1,
          brandId: input.brandId,
          colors: input.colors,
          imageType: input.imageType,
          referenceImage: input.referenceImage
        };

        const result = await ImageService.generateWithRag(imageRequest);

        // For real results, check if we have imageUrl or need to handle job status
        if (result.imageUrl) {
          return NextResponse.json({ success: true, imageUrl: result.imageUrl });
        } else if (result.jobId) {
          // Return job info for async generation
          return NextResponse.json({
            success: true,
            jobId: result.jobId,
            status: result.status,
            message: result.message
          });
        } else {
          return NextResponse.json({ success: true, ...result });
        }
      } catch (error: any) {
        console.error('[Image Generation Error]:', error);

        // Check if it's a database setup issue and provide a helpful response
        if (error.message?.includes('Foreign key constraint') || error.message?.includes('does not exist')) {
          return NextResponse.json({
            success: true,
            imageUrl: `https://picsum.photos/seed/demo-${Date.now()}/1024/1024.jpg`,
            demo: true,
            message: "Image generated (demo mode - database setup required for full functionality)"
          });
        }

        return NextResponse.json({
          success: false,
          error: error.message || 'Image generation failed'
        }, { status: 500 });
      }
    }

    if (action === 'fetch-analytics') {
      // Mastra approach - commented out
      // const tool = mastra.getTool('fetch-post-analytics');
      // const result = await tool.execute({ postId: input.postId });
      // return NextResponse.json({ success: true, ...result });

      // Direct AnalyticsService approach
      try {

        if (!input.postId) {
          return NextResponse.json({
            success: false,
            error: 'postId is required for analytics fetching'
          }, { status: 400 });
        }

        // Get post analytics
        const analytics = await AnalyticsService.getPostAnalytics(input.postId, businessId);

        if (!analytics) {
          return NextResponse.json({
            success: false,
            error: 'Post not found or no analytics available'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          analytics
        });
      } catch (error: any) {
        console.error('[Analytics Fetch Error]:', error);

        // Check if it's a database setup issue and provide a helpful response
        if (error.message?.includes('does not exist') || error.message?.includes('Foreign key constraint')) {
          return NextResponse.json({
            success: true,
            analytics: {
              postId: input.postId,
              platform: 'FACEBOOK',
              likes: 150,
              comments: 25,
              shares: 12,
              saves: 8,
              reach: 1200,
              impressions: 2500,
              engagementRate: 7.8,
              lastUpdated: new Date()
            },
            demo: true,
            message: "Demo analytics data (database setup required for real data)"
          });
        }

        return NextResponse.json({
          success: false,
          error: error.message || 'Analytics fetching failed'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Social AI API Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}




//! new Work for the queue processing
// import { NextRequest, NextResponse } from 'next/server';
// import { z } from 'zod';
// import { apiHandler, AuthContext, parseBody } from '@/lib/api-utils';
// import { addSocialTaskToQueue } from '@/lib/socialQueue';
// import prisma from '@/lib/prisma';

// /**
//  * Validation Schemas
//  */
// const GenerateContentSchema = z.object({
//   action: z.literal('generate-content'),
//   input: z.object({
//     prompt: z.string().min(1),
//     platforms: z.array(z.string()).optional(),
//     tone: z.string().optional(),
//     threadId: z.string().optional(),
//     model: z.string().optional(),
//   }),
// });

// const RefineContentSchema = z.object({
//   action: z.literal('refine-content'),
//   input: z.object({
//     content: z.string().min(1),
//     refinement: z.string().min(1),
//     threadId: z.string().optional(),
//   }),
// });

// const GenerateImageSchema = z.object({
//   action: z.literal('generate-image'),
//   input: z.object({
//     prompt: z.string().min(1),
//     size: z.enum(['square', 'landscape', 'portrait']).optional(),
//     aspectRatio: z.string().optional(),
//     quality: z.enum(['standard', 'hd']).optional(),
//     model: z.string().optional(),
//     style: z.string().optional(),
//     brandId: z.string().optional(),
//   }),
// });

// const FetchAnalyticsSchema = z.object({
//   action: z.literal('fetch-analytics'),
//   input: z.object({
//     postId: z.string().min(1),
//   }),
// });

// const SocialAIRequestSchema = z.discriminatedUnion('action', [
//   GenerateContentSchema,
//   RefineContentSchema,
//   GenerateImageSchema,
//   FetchAnalyticsSchema,
//   z.object({
//     action: z.literal('get-status'),
//     input: z.object({
//       jobId: z.string(),
//     }),
//   }),
// ]);

// /**
//  * @api {post} /api/social/ai AI Content Generation & Management
//  * @apiDescription Hand off heavy AI tasks to BullMQ asynchronously.
//  */
// export const POST = apiHandler(async (req: NextRequest, ctx: AuthContext) => {
//   if (!ctx.businessId) {
//     return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
//   }

//   const { action, input } = await parseBody(req, SocialAIRequestSchema);

//   if (action === 'get-status') {
//     const log = await prisma.jobLog.findFirst({
//       where: {
//         jobId: input.jobId,
//         queueName: 'socialQueue',
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     if (!log) {
//       return NextResponse.json({
//         success: true,
//         status: 'queued', // Still in Redis, not yet in JobLog
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       status: log.status,
//       result: log.result,
//       error: log.error,
//     });
//   }

//   // Heavy operations are handed off to BullMQ
//   if (action === 'generate-content' || action === 'refine-content' || action === 'generate-image') {
//     const job = await addSocialTaskToQueue({
//       type: action,
//       businessId: ctx.businessId,
//       userId: ctx.user.id,
//       input,
//     });

//     return NextResponse.json({
//       success: true,
//       message: `${action} task queued successfully`,
//       jobId: job.id,
//       status: 'queued',
//     });
//   }

//   // Fast operations or proxy tasks
//   if (action === 'fetch-analytics') {
//     // Analytics fetching is also a candidate for async, but if it's just a DB read, it's fine.
//     // However, if it fetches from Meta API, it should also be async.
//     // For now, let's follow the standard and make it async to be safe.
//     const job = await addSocialTaskToQueue({
//       type: 'fetch-analytics',
//       businessId: ctx.businessId,
//       userId: ctx.user.id,
//       input,
//       postId: input.postId,
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Analytics fetch task queued successfully',
//       jobId: job.id,
//       status: 'queued',
//     });
//   }

//   return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
// });
