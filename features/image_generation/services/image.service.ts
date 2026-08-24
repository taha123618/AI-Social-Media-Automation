import { z } from "zod";
import axios from "axios";
import prisma from "@/lib/prisma";
import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import {
  ImageGenerationRequestSchema,
  ImageGenerationRequestInput,
  ImageGenerationResponseSchema,
  BrandConfig,
  IMAGE_TYPES,
  ImageTypeConfig,
  AI_MODELS
} from "@/features/image_generation/types";
import { AIService } from "@/services/ai/ai.service";
import { addImageStatusJob } from "../lib/image-queue";
import { ImageStorageService } from "@/services/image-storage.service";
import { SystemLogger } from "@/features/system/services/logger.service";


export type ImageGenerationRequest = ImageGenerationRequestInput;
export type ImageGenerationResponse = z.infer<typeof ImageGenerationResponseSchema>;



// ─── Dimension map shared across providers ────────────────────────────────────

const DIMENSION_MAP: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1216, height: 896 },
  "3:2": { width: 1136, height: 768 },
  "2:3": { width: 768, height: 1136 },
  "3:4": { width: 768, height: 1024 },
  "4:5": { width: 819, height: 1024 },
  "5:4": { width: 1024, height: 819 }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ImageService – follows the exact code pattern of RagVideoService.
 * Business logic layer that handles brand context, smart prompts,
 * and direct provider API calls (OpenAI/Stability).
 */
export class ImageService {
  private static runwayClient = new RunwayML({
    apiKey: process.env.RUNWAY_API_KEY || "",
    timeout: 20 * 1000,
    maxRetries: 3,
  });

  private static isMock = !process.env.RUNWAY_API_KEY;
  private static isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Map external API status to Prisma enum values
   */
  private static mapStatusToPrismaEnum(status: string): "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PENDING":
      case "QUEUED":
      case "THROTTLED":
        return "PENDING";
      case "PROCESSING":
      case "RUNNING":
      case "IN_PROGRESS":
        return "PROCESSING";
      case "COMPLETED":
      case "SUCCEEDED":
      case "SUCCESS":
      case "FINISHED":
        return "COMPLETED";
      case "FAILED":
      case "ERROR":
      case "CANCELLED":
      case "REJECTED":
        return "FAILED";
      default:
        console.warn(`Unknown status "${status}", defaulting to PENDING`);
        return "PENDING";
    }
  }

  static async getPendingJobs() {
    return prisma.imageGenerationJob.findMany({ where: { status: "PENDING" } });
  }

  // ─── Integrated Brand-Aware Generation (Rag Pattern) ──────────────────────

  /**
   * Generate image with brand-aware prompt using RAG/Brand context.
   * Mirrors RagVideoService.generateWithRag.
   */
  static async generateWithRag(request: ImageGenerationRequest, internalJobId?: string): Promise<ImageGenerationResponse> {
    const validated = ImageGenerationRequestSchema.parse(request);

    try {
      // 1. Get brand context (mock/db)
      const brandConfig = validated.brandId ? await this.getBrandConfig(validated.brandId) : undefined;
      const imageTypeConfig = validated.imageType ? IMAGE_TYPES[validated.imageType] : undefined;

      // 2. Build intelligent prompt using LLM (Mirrors buildSmartPrompt)
      const { prompt: smartPrompt, style } = await this.buildSmartPrompt({
        basePrompt: validated.prompt,
        brandConfig,
        imageType: imageTypeConfig,
        colorOverrides: validated.colors
      });

      // 3. Determine optimal aspect ratio
      const aspectRatio = imageTypeConfig?.aspectRatio || this.getOptimalAspectRatio(validated.imageType) || validated.aspectRatio || "1:1";

      // 4. Dispatch to core generation
      const result = await this.generateImage({
        ...validated,
        prompt: smartPrompt,
        style: style as ImageGenerationRequestInput["style"],
        aspectRatio: aspectRatio as ImageGenerationRequestInput["aspectRatio"]
      }, internalJobId);

      await SystemLogger.logActivity({
        action: "IMAGE_GENERATION_COMPLETED",
        entity: "Image",
        entityId: result.jobId,
        userId: validated.userId,
        details: { jobId: result.jobId, provider: "runway" }
      });

      return result;
    } catch (error: any) {
      console.error("[IMAGE-SERVICE] generateWithRag failed:", error);

      await SystemLogger.logError({
        message: error.message || "generateWithRag failed",
        source: "ImageService.generateWithRag",
        path: "features/image_generation/services/image.service.ts",
        stack: error.stack,
        context: { userId: validated.userId, businessId: validated.businessId }
      });

      throw error;
    }
  }

  /**
   * Build a smart, visually descriptive prompt using LLM.
   * Mirrors RagVideoService.buildSmartPrompt.
   */
  private static async buildSmartPrompt(params: {
    basePrompt?: string;
    brandConfig?: BrandConfig;
    imageType?: ImageTypeConfig;
    colorOverrides?: string[];
  }): Promise<{ prompt: string; style: string }> {
    const { basePrompt, brandConfig, imageType, colorOverrides } = params;
    const colors = colorOverrides?.length ? colorOverrides : brandConfig?.colors ?? [];

    try {
      const response = await AIService.generateJSON<{ prompt: string; style: string }>({
        messages: [
          {
            role: "system",
            content: [
              "You are an expert AI Image Prompt Engineer.",
              "Generate a highly detailed, visually descriptive prompt based on brand DNA and context.",
              "",
              "Guidelines:",
              `- Brand style: ${brandConfig?.name ?? "Professional"}`,
              `- Brand colors: ${colors.join(", ") || "harmonious palette"}`,
              `- Format: ${imageType?.name ?? "Standard"}`,
              "- Describe lighting, textures, materials, and composition.",
              "",
              "Return ONLY a JSON object:",
              '{ "prompt": "<detailed prompt>", "style": "realistic|cinematic|artistic|anime|cartoon|3d" }'
            ].join("\n")
          },
          {
            role: "user",
            content: `User Request: "${basePrompt || "High-quality professional image"}"\n${brandConfig?.guidelines ? `Guidelines: ${brandConfig.guidelines}` : ""}`
          }
        ],
        temperature: 0.7,
        maxTokens: 1000
      });

      return response;
    } catch (error) {
      console.warn("[IMAGE-SERVICE] buildSmartPrompt fallback used:", error);
      return {
        prompt: `${basePrompt || "High-quality professional image"}${brandConfig ? `, ${brandConfig.name} style` : ""}`,
        style: "realistic"
      };
    }
  }

  /**
   * Get optimal aspect ratio based on platform/type.
   * Mirrors RagVideoService.getOptimalAspectRatio.
   */
  private static getOptimalAspectRatio(platformOrType?: string): string {
    const plat = platformOrType?.toLowerCase() || "";
    if (plat.includes("instagram") || plat.includes("reel") || plat.includes("story")) return "9:16";
    if (plat.includes("youtube") || plat.includes("landscape") || plat.includes("brochure")) return "16:9";
    if (plat.includes("facebook") || plat.includes("post")) return "4:5";
    return "1:1";
  }

  // ─── Core Generation Dispatcher ──────────────────────────────────────────

  /**
   * Dispatches generation to the appropriate provider.
   */
  static async generateImage(request: ImageGenerationRequest, internalJobId?: string): Promise<ImageGenerationResponse> {
    const validated = ImageGenerationRequestSchema.parse(request);

    // Modern: Vision-enhanced enhancement if reference image exists
    let finalReferenceImage = validated.referenceImage;
    if (finalReferenceImage) {
      const storedImage = await ImageStorageService.ingestImageFromUrl(finalReferenceImage, {
        businessId: validated.businessId as string,
        userId: validated.userId,
        folder: 'reference-images'
      });
      finalReferenceImage = storedImage.url;
    }

    const enhancedPrompt = await this.enhancePromptWithVision(
      validated.prompt || "",
      validated.style,
      finalReferenceImage
    );

    // Compress and optimize the prompt to ensure it stays under 800 characters for Runway
    const optimizedPrompt = await this.compressAndOptimizePrompt(enhancedPrompt);

    const req = { ...validated, prompt: optimizedPrompt, referenceImage: finalReferenceImage, model: validated.model || 'runway-gen4-image' };

    // Strict delegation to Runway for all image generation as requested by user
    return this.generateWithRunway(req, internalJobId);
  }

  /**
   * Intelligently compresses and optimizes a prompt to stay under 800 characters
   * while preserving high-density visual details.
   */
  private static async compressAndOptimizePrompt(prompt: string): Promise<string> {
    if (!prompt || prompt.length <= 800) return prompt;

    try {
      console.log(`[IMAGE-SERVICE] Compressing long prompt (${prompt.length} chars) to under 800...`);
      const compressed = await AIService.generateWithOpenRouter({
        prompt: `System: You are a Master AI Prompt Optimizer.
Task: Compress the following image prompt into a high-density, visually descriptive version that is strictly UNDER 800 characters.
Goal: Preserve the key visual elements, lighting, composition, and brand context while removing redundant words.
Format: Output the optimized prompt text only. No preamble, no quotes.

Original Prompt:
${prompt}`,
        temperature: 0.5,
        maxTokens: 400
      });

      // Ensure hard limit of 800
      return compressed.trim().substring(0, 800);
    } catch (error) {
      console.warn("[IMAGE-SERVICE] Prompt compression failed, falling back to truncation:", error);
      return prompt.substring(0, 800);
    }
  }

  /**
   * Generate image using Runway Gen-4
   */
  static async generateWithRunway(request: ImageGenerationRequest, internalJobId?: string): Promise<ImageGenerationResponse> {
    const validatedRequest = ImageGenerationRequestSchema.parse(request);

    if (ImageService.isMock) {
      console.warn("Using MOCK Runway generation. Set RUNWAY_API_KEY for production.");
      return ImageService.mockGeneration(validatedRequest);
    }

    try {
      let runwayModel: 'gen4_image' | 'gen4_image_turbo' | 'gemini_2.5_flash' = 'gen4_image';
      if (validatedRequest.model === 'runway-gen4-image-turbo') {
        runwayModel = 'gen4_image_turbo';

        // Check if gen4_image_turbo requirements are met (both text and image inputs required)
        const hasPrompt = validatedRequest.prompt && validatedRequest.prompt.trim().length > 0;
        const hasReferenceImage = validatedRequest.referenceImage && validatedRequest.referenceImage.trim().length > 0;

        if (!hasPrompt || !hasReferenceImage) {
          console.log(`[IMAGE-SERVICE] gen4_image_turbo requires both text and image inputs. Missing: ${!hasPrompt ? 'prompt' : ''}${!hasPrompt && !hasReferenceImage ? ' and ' : ''}${!hasReferenceImage ? 'reference image' : ''}. Falling back to gen4_image.`);
          runwayModel = 'gen4_image';
        }
      } else if (validatedRequest.model === 'runway-gen4-image') {
        runwayModel = 'gen4_image';
      } else if (validatedRequest.model === 'gemini_2.5_flash') {
        runwayModel = 'gemini_2.5_flash';
      }

      // Map frontend aspect ratios to strictly Runway-accepted formats
      let mappedRatio: string;
      if (runwayModel === 'gemini_2.5_flash') {
        const isVertical = validatedRequest.aspectRatio === '9:16' || validatedRequest.aspectRatio === '4:5' || validatedRequest.aspectRatio === '2:3' || validatedRequest.aspectRatio === '3:4';
        const isLandscape = validatedRequest.aspectRatio === '16:9' || validatedRequest.aspectRatio === '4:3' || validatedRequest.aspectRatio === '3:2' || validatedRequest.aspectRatio === '5:4';
        mappedRatio = isVertical ? '768:1344' : (isLandscape ? '1344:768' : '1024:1024');
      } else {
        const isVertical = validatedRequest.aspectRatio === '9:16' || validatedRequest.aspectRatio === '4:5';
        const isLandscape = validatedRequest.aspectRatio === '16:9' || validatedRequest.aspectRatio === '4:3';
        mappedRatio = isVertical ? '720:1280' : (isLandscape ? '1280:720' : '1024:1024');
      }

      // Final safety check: strictly truncate to under 1000 (Runway's hard limit)
      // We use 800 as our "safe" target for intelligent compression, but enforce 1000 here.
      const finalPrompt = (validatedRequest.prompt || "High-quality professional image generation")
        .trim()
        .substring(0, 1000);

      console.log(`[IMAGE-SERVICE] Sending request to Runway. Prompt length: ${finalPrompt.length}`);

      // Create a new image task
      const runwayParams: Record<string, unknown> = {
        model: runwayModel,
        promptText: finalPrompt,
        ratio: mappedRatio,
      };

      // Handle reference images (Runway Gen-4 uses referenceImages array)
      if (validatedRequest.referenceImage && validatedRequest.referenceImage.trim() !== '') {
        // Advanced: Support tags if they are embedded in the prompt
        // Check if the prompt has tags like @Something
        const tags = finalPrompt.match(/@\w+/g);

        if (tags && tags.length > 0) {
          // If tags exist, we default to using the first one for the reference image
          // This allows for future expansion to multiple reference images
          runwayParams.referenceImages = [{
            uri: validatedRequest.referenceImage,
            tag: tags[0].replace('@', '')
          }];
        } else {
          runwayParams.referenceImages = [{
            uri: validatedRequest.referenceImage
          }];
        }
      }
      // Note: Do not set referenceImages at all if no valid reference image is provided
      // This prevents API validation errors for models that don't require reference images

      // Both text-to-image and image-to-image are handled by the same textToImage resource in Gen-4
      // We use a cast here because the SDK types for Gen-4 are still being finalized
      const taskResponse = await ImageService.runwayClient.textToImage.create(runwayParams as unknown as Parameters<typeof ImageService.runwayClient.textToImage.create>[0]);

      const runwayTaskId = taskResponse.id;

      // Update existing job tracking record with the Runway Task ID
      if (internalJobId) {
        await prisma.imageGenerationJob.update({
          where: { id: internalJobId },
          data: {
            providerJobId: runwayTaskId,
            status: "PENDING",
            prompt: validatedRequest.prompt || "Image generation from reference",
            aspectRatio: validatedRequest.aspectRatio,
            quality: validatedRequest.quality,
            model: validatedRequest.model,
            style: validatedRequest.style,
            variations: validatedRequest.variations,
            brandId: validatedRequest.brandId,
            colors: validatedRequest.colors,
            imageType: validatedRequest.imageType,
            referenceImage: validatedRequest.referenceImage,
            workflowId: validatedRequest.workflowId,
            executionId: validatedRequest.executionId
          }
        });

        //! IMMEDIATE QUEUEING: Add to BullMQ for status tracking
        await addImageStatusJob({
          jobId: internalJobId,
          businessId: validatedRequest.businessId as string
        }, { delay: 0 }); // Images are fast
      } else {
        // Fallback for direct calls without a pre-created internal ID
        await prisma.imageGenerationJob.create({
          data: {
            id: runwayTaskId as string, // Fallback to using Runway ID as internal ID
            providerJobId: runwayTaskId,
            businessId: validatedRequest.businessId as string,
            userId: validatedRequest.userId,
            prompt: validatedRequest.prompt || "Image generation from reference",
            status: "PENDING",
            aspectRatio: validatedRequest.aspectRatio,
            quality: validatedRequest.quality,
            model: validatedRequest.model,
            style: validatedRequest.style,
            variations: validatedRequest.variations,
            brandId: validatedRequest.brandId,
            colors: validatedRequest.colors,
            imageType: validatedRequest.imageType,
            referenceImage: validatedRequest.referenceImage,
            workflowId: validatedRequest.workflowId,
            executionId: validatedRequest.executionId
          }
        });

        // IMMEDIATE QUEUEING: Add to BullMQ for status tracking
        await addImageStatusJob({
          jobId: runwayTaskId,
          businessId: validatedRequest.businessId as string
        }, { delay: 2000 });
      }

      return {
        jobId: internalJobId || runwayTaskId,
        status: "pending",
        message: "Generation initiated"
      };

    } catch (error: any) {
      if (error instanceof RunwayML.APIError) {
        console.error(`[RUNWAY API ERROR] Status: ${error.status}, Name: ${error.name}`);
        console.error(`[RUNWAY API HEADERS]`, error.headers);

        await SystemLogger.logError({
          message: `Runway API failed (${error.status}): ${error.message}`,
          source: "ImageService.generateWithRunway",
          context: { status: error.status, name: error.name }
        });

        throw new Error(`Runway API failed (${error.status}): ${error.message}`);
      }

      if (error instanceof TaskFailedError) {
        console.error('Runway image task failed to generate:', error.taskDetails);

        await SystemLogger.logError({
          message: `Runway task failed: ${error.message}`,
          source: "ImageService.generateWithRunway",
          context: error.taskDetails
        });

        throw new Error(`Runway task failed: ${error.message}`);
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Runway image generation failed:", error);

      await SystemLogger.logError({
        message: `Runway generation failed: ${errorMessage}`,
        source: "ImageService.generateWithRunway",
        stack: error instanceof Error ? error.stack : undefined
      });

      throw new Error(`Runway generation failed: ${errorMessage}`);
    }
  }

  /**
   * Check generation status with retry logic (Mirrors VideoService.checkStatus)
   */
  static async checkJobStatus(jobId: string, retryCount: number = 3): Promise<ImageGenerationResponse> {
    const job = await prisma.imageGenerationJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error(`Image generation job not found: ${jobId}`);
    }

    if (ImageService.isMock) {
      const mockResult = await ImageService.mockStatusCheck(job);

      // Update DB for mock results so they appear in gallery
      if (mockResult.status === 'completed' && mockResult.imageUrl) {
        await prisma.imageGenerationJob.update({
          where: { id: jobId },
          data: {
            status: "COMPLETED",
            imageUrl: mockResult.imageUrl,
            completedAt: new Date()
          }
        });
      } else if (mockResult.status === 'failed') {
        await prisma.imageGenerationJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            error: "Mock generation failed"
          }
        });
      } else if (mockResult.status === 'processing') {
        await prisma.imageGenerationJob.update({
          where: { id: jobId },
          data: {
            status: "PROCESSING"
          }
        });
      }

      return mockResult;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // Use the provider's task ID (UUID) for the Runway API call
        const runwayTaskId = job.providerJobId || job.id;
        const task = await ImageService.runwayClient.tasks.retrieve(runwayTaskId);

        const taskAny = task as { status: string; output?: string[]; failure?: { code?: string; message?: string }; error?: string };
        const failureMessage = taskAny.failure?.message || taskAny.error || "";
        const statusData = {
          status: task.status,
          image_url: taskAny.output?.[0] || undefined,
          failure: failureMessage,
          completed_at: task.status === 'SUCCEEDED' ? new Date().toISOString() : undefined
        };

        const taskFailed = this.mapStatusToPrismaEnum(statusData.status) === "FAILED";

        const updatedJob = await prisma.imageGenerationJob.update({
          where: { id: jobId },
          data: {
            status: this.mapStatusToPrismaEnum(statusData.status),
            imageUrl: statusData.image_url,
            error: taskFailed ? statusData.failure || "Runway task failed" : undefined,
            completedAt: statusData.completed_at ? new Date(statusData.completed_at) : null
          }
        });

        const isCompleted = updatedJob.status === "COMPLETED";
        const message = isCompleted
          ? "Image generated successfully"
          : taskFailed
            ? `Runway task failed: ${statusData.failure || "Unknown error"}`
            : "Processing";

        return {
          jobId: updatedJob.id,
          status: updatedJob.status.toLowerCase() as ImageGenerationResponse["status"],
          imageUrl: updatedJob.imageUrl || undefined,
          message,
        };

      } catch (error: unknown) {
        if (error instanceof RunwayML.APIError) {
          console.error(`[RUNWAY API STATUS ERROR] Status: ${error.status}, Name: ${error.name} for Job: ${jobId}`);
        } else if (error instanceof TaskFailedError) {
          console.error(`[RUNWAY TASK FAILED] Job: ${jobId}`, error.taskDetails);
        }

        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < retryCount) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  // ─── Modern AI Enhancements ──────────────────────────────────────────────

  /**
   * Uses Vision AI to analyze reference image and enhance prompt.
   */
  private static async enhancePromptWithVision(prompt: string = "", style?: string, refImage?: string): Promise<string> {
    if (!prompt.trim() && !refImage) return "High-quality professional image";

    const context = refImage ? await this.analyzeReferenceImage(refImage) : "";
    try {
      return await AIService.generateWithOpenRouter({
        prompt: `Enhanced Image Prompt Engineering:
User Prompt: ${prompt || "No text prompt provided"}
Style: ${style || "Realistic"}
Reference Image Context: ${context || "No reference image context"}

Task: Generate a rich, descriptive prompt for an AI image generator (Gen-4/Dall-E). Focus on visual details, lighting, and composition. Output the enhanced prompt text only.`,
        temperature: 0.7
      });
    } catch {
      return prompt || "High-quality professional image";
    }
  }

  private static async analyzeReferenceImage(imageUrl: string): Promise<string> {
    try {
      const res = await AIService.generateCompletion({
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Describe this image aesthetic, composition, and key visual elements for prompt replication." },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }]
      });
      return res.content;
    } catch {
      return "";
    }
  }

  // ─── Worker Processing ────────────────────────────────────────────────────

  /**
   * Add an image generation job to the queue
   */
  static async queueGenerationJob(jobData: ImageGenerationRequestInput): Promise<ImageGenerationResponse> {
    const job = await prisma.imageGenerationJob.create({
      data: {
        businessId: jobData.businessId as string,
        userId: jobData.userId,
        prompt: jobData.prompt || "Image generation",
        status: "PENDING",
        aspectRatio: jobData.aspectRatio,
        quality: jobData.quality,
        model: jobData.model,
        style: jobData.style,
        variations: jobData.variations,
        brandId: jobData.brandId,
        colors: jobData.colors,
        imageType: jobData.imageType,
        referenceImage: jobData.referenceImage,
        workflowId: jobData.workflowId,
        executionId: jobData.executionId
      }
    });

    // We don't use the worker directly here to avoid circular dependencies if any,
    // but the API route can use the worker.
    // For now, we'll return the pending job info.
    return {
      jobId: job.id,
      status: "pending",
      message: "Image generation job created and pending"
    };
  }

  static async processQueuedJob(jobId: string): Promise<ImageGenerationResponse> {
    const job = await prisma.imageGenerationJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    await this.updateJobStatus(jobId, "PROCESSING");

    try {
      const result = await this.generateWithRag({
        businessId: job.businessId,
        userId: job.userId ?? undefined,
        prompt: job.prompt,
        style: job.style as ImageGenerationRequestInput["style"],
        aspectRatio: job.aspectRatio as ImageGenerationRequestInput["aspectRatio"],
        quality: job.quality as ImageGenerationRequestInput["quality"],
        model: job.model as ImageGenerationRequestInput["model"],
        variations: job.variations || 1,
        referenceImage: job.referenceImage ?? undefined,
        brandId: job.brandId ?? undefined,
        colors: job.colors as string[],
        imageType: (job as { imageType?: string }).imageType as ImageGenerationRequestInput["imageType"] ?? undefined,
        workflowId: job.workflowId ?? undefined,
        executionId: job.executionId ?? undefined
      }, jobId);

      if (result.imageUrl) {
        await prisma.imageGenerationJob.update({
          where: { id: jobId },
          data: { imageUrl: result.imageUrl, status: "COMPLETED", completedAt: new Date() }
        });

        await SystemLogger.logActivity({
          action: "IMAGE_PROCESSED",
          entity: "Image",
          entityId: jobId,
          details: { status: "COMPLETED" }
        });
      }

      return result;
    } catch (error: any) {
      await SystemLogger.logError({
        message: error.message || "processQueuedJob failed",
        source: "ImageService.processQueuedJob",
        context: { jobId }
      });
      await this.updateJobStatus(jobId, "FAILED", error instanceof Error ? error.message : "Error");
      throw error;
    }
  }

  // ─── Shared Utilities ─────────────────────────────────────────────────────

  static async updateJobStatus(jobId: string, status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", error?: string) {
    await prisma.imageGenerationJob.update({ where: { id: jobId }, data: { status, error, updatedAt: new Date() } });
  }

  static async getBrandConfig(brandId: string): Promise<BrandConfig | undefined> {
    return { id: brandId, name: "Brand", colors: ["#000"], style: "professional" };
  }

  // ─── Mock Implementations ──────────────────────────────────────────────

  private static async mockGeneration(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const jobId = `mock_${Date.now()}`;

    // Create a database record for the mock generation immediately
    await prisma.imageGenerationJob.create({
      data: {
        id: jobId,
        businessId: request.businessId as string,
        userId: request.userId,
        prompt: request.prompt || "Mock image generation",
        status: "PENDING",
        aspectRatio: request.aspectRatio,
        quality: request.quality,
        model: request.model,
        style: request.style,
        variations: request.variations,
        brandId: request.brandId,
        colors: request.colors,
        imageType: request.imageType,
        referenceImage: request.referenceImage,
        workflowId: request.workflowId,
        executionId: request.executionId
      }
    });

    // Add to status check queue
    await addImageStatusJob({
      jobId,
      businessId: request.businessId as string
    }, { delay: 2000 });

    return {
      jobId,
      status: "pending",
      message: "Mock generation initiated"
    };
  }

  private static mockStatusCheck(job: { id: string; createdAt: Date }): Promise<ImageGenerationResponse> {
    const elapsed = Date.now() - new Date(job.createdAt).getTime();
    let status: "pending" | "processing" | "completed" | "failed" = "pending";
    let imageUrl: string | undefined;

    if (elapsed > 10000) status = "processing";
    if (elapsed > 20000) {
      status = "completed";
      imageUrl = `https://mock-images.example.com/${job.id}.jpg`;
    }

    return Promise.resolve({
      jobId: job.id,
      status,
      imageUrl,
      message: status === "completed" ? "Image generated successfully" : "Processing"
    });
  }

  /**
   * Generate a single blog section image using the main Runway pipeline.
   * Reuses all AI enhancements, prompt optimization, and provider handling.
   */
  static async generateBlogSectionImage(
    prompt: string,
    options?: {
      businessId?: string;
      userId?: string;
      referenceImage?: string;
      style?: ImageGenerationRequestInput["style"];
      aspectRatio?: ImageGenerationRequestInput["aspectRatio"];
    }
  ): Promise<{ url: string; revisedPrompt: string }> {

    // Mock/dev fallback
    if (ImageService.isMock) {
      return {
        url: `https://picsum.photos/seed/blog-${Date.now()}/1344/768`,
        revisedPrompt: prompt,
      };
    }

    // STEP 1: Generate through centralized Runway pipeline
    const generation = await this.generateWithRunway({
      businessId: options?.businessId || "blog-system",
      userId: options?.userId,
      prompt,
      referenceImage: options?.referenceImage,
      style: "realistic",
      aspectRatio: "16:9",
      quality: "hd",
      model: "runway-gen4-image",
      variations: 1,
      brandId: undefined,
    });

    if (!generation.jobId) {
      throw new Error("Failed to create blog image generation job");
    }

    // STEP 2: Poll unified status system
    const deadline = Date.now() + 90000;
    let pollInterval = 5000;
    let latestStatus: ImageGenerationResponse | null = null;

    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      pollInterval = Math.min(pollInterval + 2000, 10000);

      latestStatus = await this.checkJobStatus(generation.jobId);

      if (latestStatus.status === "completed" && latestStatus.imageUrl) {
        return {
          url: latestStatus.imageUrl,
          revisedPrompt: prompt,
        };
      }

      if (latestStatus.status === "failed") {
        throw new Error(
          `Blog image generation failed for job ${generation.jobId}: ${latestStatus.message}`
        );
      }
    }

    throw new Error(
      `Blog image generation timed out after 90s: ${generation.jobId}`
    );
  }

  static getAIModels() { return AI_MODELS; }
  static getImageTypes() { return IMAGE_TYPES; }
  static async applyColorOverlay(url: string, colors: string[]) { return url; }

  /**
   * Apply brand consistency filters to generated image
   */
  static async applyBrandFilters(
    businessId: string,
    imageUrl: string,
    options?: {
      addWatermark?: boolean;
      applyColorGrade?: boolean;
      resizeForPlatform?: string;
    }
  ): Promise<string> {
    // Get brand profile for consistency
    const profile = await prisma.businessProfile.findUnique({
      where: { businessId }
    });

    if (!profile) {
      console.warn(`[BRAND FILTERS] No brand profile found for business ${businessId}`);
      return imageUrl;
    }

    console.log(`[BRAND FILTERS] Applying filters for business ${businessId} to ${imageUrl}`);

    // Robust URL construction for the branded asset
    const filteredUrl = new URL(imageUrl);

    // Core brand markers
    filteredUrl.searchParams.set('branded', 'true');
    filteredUrl.searchParams.set('bid', businessId);

    // Add watermark from brand profile if requested
    if (options?.addWatermark && profile.watermark) {
      filteredUrl.searchParams.set('wm', profile.watermark);
    }

    // Apply color grading based on brand palette
    if (options?.applyColorGrade && profile.colorPalette) {
      const palette = typeof profile.colorPalette === 'string'
        ? JSON.parse(profile.colorPalette)
        : profile.colorPalette;

      if (palette && Array.isArray(palette) && palette.length > 0) {
        filteredUrl.searchParams.set('accent', palette[0]);
      }
    }

    // Platform-specific resizing and optimization
    if (options?.resizeForPlatform) {
      filteredUrl.searchParams.set('target', options.resizeForPlatform);
    }

    return filteredUrl.toString();
  }
}

export { IMAGE_TYPES };
