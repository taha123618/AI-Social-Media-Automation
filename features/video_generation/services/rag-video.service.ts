import { VideoService } from "@/features/video_generation/services/video.service";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { BrandTone } from "@/features/video_generation/types";
import { AIService } from "@/services/ai/ai.service";
import { SystemLogger } from "@/features/system/services/logger.service";

/**
 * Integrated service that combines RAG pipeline with video generation
 * Creates brand-aware video prompts using business context
 */
export class RagVideoService {
  /**
   * Generate video with brand-aware prompt using RAG pipeline
   */
  static async generateWithRag(request: {
    businessId: string;
    userId: string;
    contentType: string; // "product demo", "testimonial", "explainer", etc.
    targetAudience?: string;
    tone?: keyof typeof BrandTone;
    customInstructions?: string;
    platform?: string; // for aspect ratio optimization
    duration?: number;
    quality?: "standard" | "hd" | "4k";
    model?: "gen4.5" | "gen4_turbo" | "gen4_aleph" | "act_two" | "veo3.1" | "veo3.1_fast" | "veo3";
  }) {
    const {
      businessId,
      userId,
      contentType,
      targetAudience,
      tone,
      customInstructions,
      platform,
      duration = 15,
      quality = "hd",
      model = "gen4.5"
    } = request;

    await SystemLogger.logActivity({
      action: "VIDEO_RAG_GENERATION_STARTED",
      entity: "VideoGeneration",
      details: { businessId, contentType, model }
    });

    try {
      // 1. Get comprehensive brand context
      const brandContext = await KnowledgeService.getBrandContext(businessId, userId);
      console.log("[RAG-VIDEO] Brand context received:", brandContext.substring(0, 200) + "...");

      // 2. Build intelligent prompt using LLM
      const { prompt, style } = await this.buildSmartPrompt({
        brandContext,
        contentType,
        targetAudience,
        tone,
        customInstructions
      });
      console.log("[RAG-VIDEO] Generated prompt length:", prompt.length);
      console.log("[RAG-VIDEO] Generated style:", style);

      // 3. Determine optimal aspect ratio based on platform
      const aspectRatio = this.getOptimalAspectRatio(platform);

      // 4. Generate video using Runway
      console.log("[RAG-VIDEO] Calling VideoService with:", {
        businessId,
        visualPrompt: prompt.substring(0, 100) + "...",
        style,
        duration,
        aspectRatio,
        quality,
        model
      });

      const result = await VideoService.generateWithRunway({
        businessId,
        visualPrompt: prompt.length > 2000 ? prompt.substring(0, 2000) : prompt,
        style: style as any,
        duration,
        aspectRatio: aspectRatio as any,
        quality,
        model: model as "gen4.5" | "gen4_turbo" | "gen4_aleph" | "act_two" | "veo3.1" | "veo3.1_fast" | "veo3"
      });

      await SystemLogger.logActivity({
        action: "VIDEO_RAG_GENERATION_COMPLETED",
        entity: "VideoGeneration",
        entityId: result.jobId,
        details: { businessId, platform }
      });

      return {
        ...result,
        brandContextUsed: brandContext,
        generatedPrompt: prompt
      };

    } catch (error: any) {
      console.error("RAG video generation failed:", error);
      await SystemLogger.logError({
        message: error.message || "RAG video generation failed",
        source: "RagVideoService.generateWithRag",
        context: { businessId, contentType }
      });
      throw new Error(`Failed to generate brand-aware video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build a smart, visually descriptive prompt using LLM
   */
  private static async buildSmartPrompt(params: {
    brandContext: string;
    contentType: string;
    targetAudience?: string;
    tone?: keyof typeof BrandTone;
    customInstructions?: string;
  }): Promise<{ prompt: string; style: string }> {
    const { brandContext, contentType, targetAudience, tone, customInstructions } = params;

    try {
      const response = await AIService.generateJSON<{ prompt: string; style: string }>({
        messages: [
          {
            role: "system",
            content: `You are an expert AI Video Prompt Engineer. Your task is to take a Brand DNA and context, and generate a highly detailed, visually descriptive prompt for a high-end video generation AI (like Runway Gen-3/Gen-4).

Guidelines:
- Describe scenes with vivid, cinematic language.
- Include details about lighting, camera movement, colors, and textures.
- Ensure the brand's tone and values are visually represented.
- Avoid generic buzzwords; be specific.

Return ONLY a JSON object with two fields:
- "prompt": The highly detailed visual prompt.
- "style": One of [realistic, cinematic, animated, artistic, professional].`
          },
          {
            role: "user",
            content: `BRAND CONTEXT:
${brandContext}

CONTENT TYPE: ${contentType}
TARGET AUDIENCE: ${targetAudience || 'General'}
PREFERRED TONE: ${tone || 'Professional'}
CUSTOM INSTRUCTIONS: ${customInstructions || 'None'}

Generate the smart prompt now:`
          }
        ],
        temperature: 0.7,
      });

      console.log("[RAG-VIDEO] Successfully generated smart prompt:", response);
      await SystemLogger.logActivity({
        action: "VIDEO_SMART_PROMPT_GENERATED",
        entity: "VideoGeneration",
        details: { style: response.style, promptLength: response.prompt.length }
      });
      return response;
    } catch (error) {
      console.warn("[RAG-VIDEO] Failed to generate smart prompt, using fallback.", error);
      console.log("[RAG-VIDEO] Brand context length:", brandContext.length);
      console.log("[RAG-VIDEO] Content type:", contentType);
      return {
        prompt: `High quality ${contentType} video reflecting brand: ${brandContext.substring(0, 100)}...`,
        style: "cinematic"
      };
    }
  }

  /**
   * Map brand tone to video style
   */
  private static mapToneToStyle(tone: keyof typeof BrandTone): string {
    switch (tone) {
      case "PROFESSIONAL":
        return "cinematic";
      case "FRIENDLY":
        return "friendly";
      case "CREATIVE":
        return "artistic";
      case "TECHNICAL":
        return "realistic";
      case "LUXURY":
        return "cinematic";
      case "CASUAL":
        return "friendly";
      default:
        return "professional";
    }
  }

  /**
   * Get optimal aspect ratio for platform
   */
  private static getOptimalAspectRatio(platform?: string): string {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return "1:1"; // Square for feed posts
      case "tiktok":
      case "youtube_shorts":
        return "9:16"; // Portrait for vertical videos
      case "youtube":
      case "linkedin":
        return "16:9"; // Landscape for desktop
      case "facebook":
        return "4:5"; // Vertical for stories/feed
      default:
        return "16:9"; // Default landscape
    }
  }

  /**
   * Monitor job status with automatic polling
   */
  static async pollJobStatus(jobId: string, maxAttempts = 20): Promise<{
    jobId: string;
    status: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  }> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await VideoService.checkStatus(jobId);

        if (status.status === "completed" || status.status === "failed") {
          return status;
        }

        // Wait 30 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 30000));
        attempts++;
      } catch (error) {
        console.error(`Status check failed on attempt ${attempts + 1}:`, error);
        await new Promise(resolve => setTimeout(resolve, 30000));
        attempts++;
      }
    }

    throw new Error(`Job ${jobId} did not complete within expected time`);
  }
}