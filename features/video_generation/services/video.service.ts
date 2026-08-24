import { z } from "zod";
import axios from "axios";
import prisma from "@/lib/prisma";
import RunwayML, { TaskFailedError } from '@runwayml/sdk';

import { VideoGenerationRequestSchema, VideoGenerationRequestInput, VideoGenerationResponseSchema } from "@/features/video_generation/types";
import { addVideoStatusJob } from "../lib/video-queue";
import { ImageStorageService } from "@/services/image-storage.service";
import { SystemLogger } from "@/features/system/services/logger.service";



export type VideoGenerationRequest = VideoGenerationRequestInput;
export type VideoGenerationResponse = z.infer<typeof VideoGenerationResponseSchema>;

// Configuration interfaces
interface RunwayConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

interface LumaConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

export class VideoService {
  private static runwayClient = new RunwayML({
    apiKey: process.env.RUNWAY_API_KEY || "",
    timeout: 20 * 1000, // 20 seconds (default is 1 minute)
    maxRetries: 2, // default is 2
  });

  private static isMock = !process.env.RUNWAY_API_KEY;

  private static runwayConfig = {
    model: "gen4.5"
  };

  private static lumaConfig: LumaConfig = {
    apiKey: process.env.LUMA_API_KEY || "mock-luma-key",
    apiUrl: "https://api.lumalabs.ai/dream-machine/v1",
    model: "dream-machine"
  };

  /**
   * Map external API status to Prisma enum values
   */
  private static mapStatusToPrismaEnum(status: string): "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" {
    const statusUpper = status.toUpperCase();

    // Map various API status values to Prisma enum
    switch (statusUpper) {
      case "PENDING":
      case "QUEUED":
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

  /**
   * Generate video using Runway Accepted values: "gen4.5", "gen4_turbo", "gen4_aleph", "act_two", "veo3", "veo3.1", "veo3.1_fast"
   */
  static async generateWithRunway(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const validatedRequest = VideoGenerationRequestSchema.parse(request);

    if (validatedRequest.model === 'gen4_aleph') {
      return this.generateVideoToVideo(validatedRequest);
    }

    if (VideoService.isMock) {
      console.warn("Using MOCK Runway generation. Set RUNWAY_API_KEY for production.");
      return VideoService.mockGeneration(validatedRequest);
    }

    try {
      // Map frontend aspect ratios to strictly Runway-accepted formats
      const isVertical = validatedRequest.aspectRatio === '9:16' || validatedRequest.aspectRatio === '4:5' || validatedRequest.aspectRatio === '720:1280';
      const mappedRatio = isVertical ? '720:1280' : '1280:720';

      // Model-aware duration mapping to respect Runway constraints
      const mapDurationForModel = (model: string, requested: number): number => {
        const val = Math.round(requested || 5);
        if (model === 'gen4.5') return Math.max(2, Math.min(10, val));
        if (model === 'veo3') return 8;
        if (model.includes('veo3.1')) {
          // Allowed: 4, 6, 8
          if (val <= 5) return 4;
          if (val <= 7) return 6;
          return 8;
        }
        // Default fallback for newer/unknown models (often 5/10)
        return val > 7 ? 10 : 5;
      };

      const mappedDuration = mapDurationForModel(validatedRequest.model || 'gen4.5', validatedRequest.duration || 5);

      // Handle prompt image storage
      let finalPromptImage = validatedRequest.promptImage;
      if (finalPromptImage) {
        const storedImage = await ImageStorageService.ingestImageFromUrl(finalPromptImage, {
          businessId: validatedRequest.businessId as string,
          folder: 'video-references'
        });
        finalPromptImage = storedImage.url;
      }

      // Enhance the visual prompt using the new UI attributes
      let enhancedPrompt = validatedRequest.visualPrompt || '';

      // If prompt is empty but we have an asset, provide a generic descriptive fallback
      if (!enhancedPrompt.trim() && (validatedRequest.promptImage || validatedRequest.videoUri)) {
        enhancedPrompt = "High quality video generation based on the provided reference asset";
      }

      if (validatedRequest.contentType && validatedRequest.contentType !== 'text_to_reel' && enhancedPrompt.trim()) {
        const typeContext = validatedRequest.contentType.replace(/_/g, " ").toUpperCase();
        enhancedPrompt = `[${typeContext}] ${enhancedPrompt}`;
      }
      if (validatedRequest.style && !enhancedPrompt.includes(`Rendered precisely in a highly ${validatedRequest.style} visual style`)) {
        enhancedPrompt = `${enhancedPrompt}. Rendered precisely in a highly ${validatedRequest.style} visual style.`;
      }

      // Limit prompt length to prevent API failures (Runway has character limits)
      if (enhancedPrompt.length > 800) {
        enhancedPrompt = enhancedPrompt.substring(0, 797) + '...';
        console.warn('Prompt truncated to 800 characters to prevent API failure');
      }

      // Create a new image-to-video or text-to-video task with advanced SDK options
      const runwayParams: Record<string, string | number> = {
        model: validatedRequest.model || 'gen4.5',
        promptText: enhancedPrompt,
        ratio: mappedRatio,
        duration: mappedDuration,
      };

      let taskResponse;
      if (finalPromptImage) {
        runwayParams.promptImage = finalPromptImage;
        taskResponse = await VideoService.runwayClient.imageToVideo
          .create(runwayParams as any, {
            timeout: 60 * 1000, // 1 minute per-request override
            maxRetries: 3,
          })
          .withResponse();
      } else {
        taskResponse = await VideoService.runwayClient.textToVideo
          .create(runwayParams as any, {
            timeout: 60 * 1000, // 1 minute per-request override
            maxRetries: 3,
          })
          .withResponse();
      }

      const { data: task, response: rawResponse } = taskResponse;

      const jobId = task.id;

      console.log(`[RUNWAY] Task ${jobId} initiated. Status: ${rawResponse.status} ${rawResponse.statusText}`);
      const traceId = rawResponse.headers.get('x-runway-trace-id');
      if (traceId) console.log(`[RUNWAY] Trace ID: ${traceId}`);

      // Store job tracking record
      await prisma.videoGenerationJob.create({
        data: {
          id: jobId,
          businessId: validatedRequest.businessId as string,
          provider: "RUNWAY",
          prompt: enhancedPrompt || 'Image-to-Video Task',
          status: "PENDING",
          duration: validatedRequest.duration,
          aspectRatio: validatedRequest.aspectRatio,
          quality: validatedRequest.quality,
          workflowId: validatedRequest.workflowId,
          executionId: validatedRequest.executionId
        }
      });

      await addVideoStatusJob({
        jobId,
        businessId: validatedRequest.businessId as string
      }, { delay: 0 }); // Generation takes at least 5s

      await SystemLogger.logActivity({
        action: "VIDEO_GENERATION_STARTED",
        entity: "VideoGenerationJob",
        entityId: jobId,
        details: { businessId: validatedRequest.businessId, provider: "RUNWAY", model: validatedRequest.model }
      });

      return {
        jobId,
        status: "pending",
        estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000) // Estimate 5 minutes
      };

    } catch (error: any) {
      await SystemLogger.logError({
        message: error.message || "Runway generation failed",
        source: "VideoService.generateWithRunway",
        context: { businessId: request.businessId }
      });
      if (error instanceof RunwayML.APIError) {
        console.error(`[RUNWAY API ERROR] Status: ${error.status}, Name: ${error.name}`);
        console.error(`[RUNWAY API HEADERS]`, error.headers);
        throw new Error(`Runway API failed (${error.status}): ${error.message}`);
      }

      if (error instanceof TaskFailedError) {
        console.error('Runway video task failed to generate:', error.taskDetails);
        throw new Error(`Runway task failed: ${error.message}`);
      }

      console.error("Runway SDK error:", error);
      throw new Error(`Runway generation failed: ${error.message}`);
    }
  }

  /**
   * Generate video using Luma Dream Machine
   */
  static async generateWithLuma(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const validatedRequest = VideoGenerationRequestSchema.parse(request);

    if (VideoService.isMock) {
      console.warn("Using MOCK Luma generation. Set LUMA_API_KEY for production.");
      return VideoService.mockGeneration(validatedRequest);
    }

    try {
      // Enhance the visual prompt using the new UI attributes
      let enhancedPrompt = validatedRequest.visualPrompt || '';
      if (validatedRequest.contentType && validatedRequest.contentType !== 'text_to_reel') {
        const typeContext = validatedRequest.contentType.replace(/_/g, " ").toUpperCase();
        enhancedPrompt = `[${typeContext}] ${enhancedPrompt}`;
      }
      if (validatedRequest.style) {
        enhancedPrompt = `${enhancedPrompt}. Rendered precisely in a highly ${validatedRequest.style} visual style.`;
      }

      // Handle prompt image storage
      let finalPromptImage = validatedRequest.promptImage;
      if (finalPromptImage) {
        const storedImage = await ImageStorageService.ingestImageFromUrl(finalPromptImage, {
          businessId: validatedRequest.businessId as string,
          folder: 'video-references'
        });
        finalPromptImage = storedImage.url;
      }

      // Prepare Luma API request
      const lumaPayload = {
        prompt: enhancedPrompt,
        aspect_ratio: validatedRequest.aspectRatio,
        loop: false,
        duration: validatedRequest.duration,
        keyframes: finalPromptImage ? {
          frame0: {
            type: "image",
            url: finalPromptImage
          }
        } : undefined
      };

      const response = await axios.post<{ id: string }>(
        `${VideoService.lumaConfig.apiUrl}/generations`,
        lumaPayload,
        {
          headers: {
            "Authorization": `Bearer ${VideoService.lumaConfig.apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const jobId = response.data.id;

      // Store job tracking record
      await prisma.videoGenerationJob.create({
        data: {
          id: jobId,
          businessId: validatedRequest.businessId as string,
          provider: "LUMA",
          prompt: enhancedPrompt || 'Luma Generation Task',
          status: "PENDING",
          duration: validatedRequest.duration,
          aspectRatio: validatedRequest.aspectRatio,
          quality: validatedRequest.quality,
          workflowId: validatedRequest.workflowId,
          executionId: validatedRequest.executionId
        }
      });

      await addVideoStatusJob({
        jobId,
        businessId: validatedRequest.businessId as string
      }, { delay: 5000 });

      await SystemLogger.logActivity({
        action: "VIDEO_GENERATION_STARTED",
        entity: "VideoGenerationJob",
        entityId: jobId,
        details: { businessId: validatedRequest.businessId, provider: "LUMA" }
      });

      return VideoGenerationResponseSchema.parse({
        jobId,
        status: "pending",
        estimatedCompletion: new Date(Date.now() + 3 * 60 * 1000) // Estimate 3 minutes
      });

    } catch (error: any) {
      console.error("Luma generation failed:", error);
      await SystemLogger.logError({
        message: error.message || "Luma generation failed",
        source: "VideoService.generateWithLuma",
        context: { businessId: request.businessId }
      });
      throw new Error(`Luma generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate video-to-video using Runway Gen-4 Aleph
   */
  static async generateVideoToVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const validatedRequest = VideoGenerationRequestSchema.parse(request);

    if (!validatedRequest.videoUri) {
      throw new Error("Source video (videoUri) is required for video-to-video generation");
    }

    if (VideoService.isMock) {
      console.warn("Using MOCK Runway video-to-video generation.");
      const mockResult = await VideoService.mockGeneration(validatedRequest);

      // Store mock job
      await prisma.videoGenerationJob.create({
        data: {
          id: mockResult.jobId,
          businessId: validatedRequest.businessId as string,
          provider: "RUNWAY",
          prompt: validatedRequest.visualPrompt || 'Video-to-Video Task',
          status: "PENDING",
          duration: validatedRequest.duration,
          aspectRatio: validatedRequest.aspectRatio,
          quality: validatedRequest.quality
        }
      });

      return mockResult;
    }

    try {
      // Map ratios
      const isVertical = validatedRequest.aspectRatio === '9:16' || validatedRequest.aspectRatio === '4:5' || validatedRequest.aspectRatio === '720:1280';
      const mappedRatio = isVertical ? '720:1280' : '1280:720';

      const runwayParams: any = {
        model: 'gen4_aleph',
        videoUri: validatedRequest.videoUri,
        promptText: validatedRequest.visualPrompt?.trim() || 'Professional video transformation maintaining source motion and subject',
        ratio: mappedRatio,
      };

      // Handle references (optional but supported)
      let finalPromptImage = validatedRequest.promptImage;
      if (finalPromptImage) {
        const storedImage = await ImageStorageService.ingestImageFromUrl(finalPromptImage, {
          businessId: validatedRequest.businessId as string,
          folder: 'video-references'
        });
        finalPromptImage = storedImage.url;
      }

      if (finalPromptImage) {
        runwayParams.references = [
          {
            type: 'image',
            uri: finalPromptImage
          }
        ];
      }

      console.log(`[RUNWAY V2V] Initiating task with model gen4_aleph...`);

      const taskResponse = await (VideoService.runwayClient as any).videoToVideo
        .create(runwayParams, {
          timeout: 60 * 1000,
          maxRetries: 2
        })
        .withResponse();

      const task = (taskResponse as any).data;
      const jobId = task.id;

      console.log(`[RUNWAY V2V] Task ${jobId} initiated.`);

      // Store job
      await prisma.videoGenerationJob.create({
        data: {
          id: jobId,
          businessId: validatedRequest.businessId as string,
          provider: "RUNWAY",
          prompt: validatedRequest.visualPrompt || 'Video-to-Video Task',
          status: "PENDING",
          duration: validatedRequest.duration,
          aspectRatio: validatedRequest.aspectRatio,
          quality: validatedRequest.quality,
          workflowId: validatedRequest.workflowId,
          executionId: validatedRequest.executionId
        }
      });

      // Immediate Queueing
      await addVideoStatusJob({
        jobId,
        businessId: validatedRequest.businessId as string
      }, { delay: 5000 });

      return {
        jobId,
        status: "pending",
        estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000)
      };

    } catch (error: any) {
      console.error("[RUNWAY V2V ERROR]", error);
      if (error instanceof RunwayML.APIError) {
        throw new Error(`Runway V2V API failed (${error.status}): ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check generation status with retry logic
   */
  static async checkStatus(jobId: string, retryCount: number = 3): Promise<VideoGenerationResponse> {
    const job = await prisma.videoGenerationJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error(`Video generation job not found: ${jobId}`);
    }

    if (VideoService.isMock) {
      return VideoService.mockStatusCheck(job);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        let statusData: {
          status: string;
          video_url?: string;
          thumbnail_url?: string;
          completed_at?: string;
        };

        if (job.provider === "RUNWAY") {
          const task = await VideoService.runwayClient.tasks.retrieve(jobId) as any;
          statusData = {
            status: task.status,
            video_url: task.output?.[0] || undefined,
            thumbnail_url: task.output?.[1] || task.thumbnail_url || undefined,
            completed_at: task.status === 'SUCCEEDED' ? new Date().toISOString() : undefined
          };
        } else {
          const response = await axios.get(
            `${VideoService.lumaConfig.apiUrl}/generations/${jobId}`,
            {
              headers: {
                "Authorization": `Bearer ${VideoService.lumaConfig.apiKey}`
              },
              timeout: 10000 // 10 second timeout
            }
          );
          const lumaData = response.data as any;
          statusData = {
            status: lumaData.status,
            video_url: lumaData.video_url,
            thumbnail_url: lumaData.thumbnail_url,
            completed_at: lumaData.completed_at
          };
        }

        // Update job status in database
        const updatedJob = await prisma.videoGenerationJob.update({
          where: { id: jobId },
          data: {
            status: this.mapStatusToPrismaEnum(statusData.status),
            videoUrl: statusData.video_url,
            thumbnailUrl: statusData.thumbnail_url,
            completedAt: statusData.completed_at ? new Date(statusData.completed_at) : null
          }
        });

        await SystemLogger.logActivity({
          action: "VIDEO_STATUS_UPDATED",
          entity: "VideoGenerationJob",
          entityId: jobId,
          details: { status: updatedJob.status, provider: job.provider }
        });

        return {
          jobId: updatedJob.id,
          status: updatedJob.status.toLowerCase() as any,
          videoUrl: updatedJob.videoUrl || undefined,
          thumbnailUrl: updatedJob.thumbnailUrl || undefined,
          estimatedCompletion: updatedJob.completedAt || undefined,
          error: updatedJob.status === "FAILED" ? updatedJob.error || undefined : undefined
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Status check attempt ${attempt} failed for job ${jobId}:`, lastError.message);

        if (attempt < retryCount) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error(`Status check failed after ${retryCount} attempts for job ${jobId}:`, lastError);
    throw new Error(`Status check failed after ${retryCount} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Apply brand consistency filters to generated video
   */
  static async applyBrandFilters(
    businessId: string,
    videoUrl: string,
    options?: {
      addWatermark?: boolean;
      applyColorGrade?: boolean;
      resizeForPlatform?: string; // instagram, tiktok, youtube, etc.
    }
  ): Promise<string> {
    // Get brand profile for consistency
    const profile = await prisma.businessProfile.findUnique({
      where: { businessId }
    });

    if (!profile) {
      console.warn(`[BRAND FILTERS] No brand profile found for business ${businessId}`);
      return videoUrl;
    }

    console.log(`[BRAND FILTERS] Applying filters for business ${businessId} to ${videoUrl}`);

    // Robust URL construction for the branded asset
    const filteredUrl = new URL(videoUrl);

    // Core brand markers
    filteredUrl.searchParams.set('branded', 'true');
    filteredUrl.searchParams.set('bid', businessId);

    // Add watermark from brand profile if requested
    if (options?.addWatermark && profile.watermark) {
      filteredUrl.searchParams.set('wm', profile.watermark);
      filteredUrl.searchParams.set('wm_pos', 'bottom-right');
    }

    // Apply color grading based on brand palette
    if (options?.applyColorGrade && profile.colorPalette) {
      const palette = typeof profile.colorPalette === 'string'
        ? JSON.parse(profile.colorPalette)
        : profile.colorPalette;

      if (palette && Array.isArray(palette) && palette.length > 0) {
        filteredUrl.searchParams.set('accent', palette[0]);
        filteredUrl.searchParams.set('palette', JSON.stringify(palette));
      }
    }

    // Platform-specific resizing and optimization
    if (options?.resizeForPlatform) {
      filteredUrl.searchParams.set('target', options.resizeForPlatform);

      // Auto-set optimal dimensions based on industry standard platform ratios
      const platformRatios: Record<string, string> = {
        'instagram': '1:1',
        'tiktok': '9:16',
        'youtube': '16:9',
        'linkedin': '16:9',
        'facebook': '1:1'
      };

      if (platformRatios[options.resizeForPlatform]) {
        filteredUrl.searchParams.set('ratio', platformRatios[options.resizeForPlatform]);
      }
    }

    // In a production environment with a dedicated processing worker (e.g., BullMQ),
    // we would trigger an async job here to generate the physical asset:
    /*
    await videoProcessingQueue.add('process-brand-filters', {
      sourceUrl: videoUrl,
      businessId,
      options
    });
    */

    return filteredUrl.toString();
  }

  /**
   * Refresh video URL if it has expired
   */
  static async refreshVideoUrl(jobId: string): Promise<string | null> {
    console.log('VideoService.refreshVideoUrl - Job ID:', jobId);
    try {
      const job = await prisma.videoGenerationJob.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        console.warn(`VideoService.refreshVideoUrl - Job ${jobId} not found`);
        return null;
      }

      let freshVideoUrl = null;

      if (job.provider === "RUNWAY") {
        console.log('VideoService.refreshVideoUrl - Calling Runway API for job:', jobId);
        const task = await VideoService.runwayClient.tasks.retrieve(jobId) as any;
        freshVideoUrl = task.output?.[0];
      } else if (job.provider === "LUMA") {
        console.log('VideoService.refreshVideoUrl - Calling Luma API for job:', jobId);
        const response = await axios.get(
          `${VideoService.lumaConfig.apiUrl}/generations/${jobId}`,
          {
            headers: {
              "Authorization": `Bearer ${VideoService.lumaConfig.apiKey}`
            },
            timeout: 10000
          }
        );
        freshVideoUrl = (response.data as any).video_url;
      }

      if (freshVideoUrl && freshVideoUrl !== job.videoUrl) {
        console.log(`VideoService.refreshVideoUrl - Updating URL for job ${jobId}`);
        await prisma.videoGenerationJob.update({
          where: { id: jobId },
          data: { videoUrl: freshVideoUrl }
        });
        return freshVideoUrl;
      }

      return job.videoUrl;
    } catch (error) {
      console.error(`Failed to refresh video URL for job ${jobId}:`, error);
      return null;
    }
  }

  /**
   * Get all video generation jobs for a business
   */
  static async getBusinessJobs(businessId: string, limit: number = 50, offset: number = 0) {
    return await prisma.videoGenerationJob.findMany({
      where: businessId ? { businessId } : {}, // Only filter if businessId provided
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get total count of video generation jobs for a business
   */
  static async getBusinessJobsCount(businessId: string) {
    return await prisma.videoGenerationJob.count({
      where: businessId ? { businessId } : {}
    });
  }

  /**
   * Get all pending/processing video jobs (for worker polling)
   */
  static async getPendingJobs() {
    return await prisma.videoGenerationJob.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"]
        }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  /**
   * Cancel a video generation job
   */
  static async cancelJob(jobId: string): Promise<boolean> {
    const job = await prisma.videoGenerationJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error(`Video generation job not found: ${jobId}`);
    }

    if (job.status !== "PENDING" && job.status !== "PROCESSING") {
      throw new Error(`Cannot cancel job in ${job.status} status`);
    }

    if (VideoService.isMock) {
      await prisma.videoGenerationJob.update({
        where: { id: jobId },
        data: { status: "CANCELLED" }
      });
      return true;
    }

    try {
      if (job.provider === "RUNWAY") {
        await VideoService.runwayClient.tasks.delete(jobId);
      } else {
        await axios.delete(
          `${VideoService.lumaConfig.apiUrl}/generations/${jobId}`,
          {
            headers: {
              "Authorization": `Bearer ${VideoService.lumaConfig.apiKey}`
            }
          }
        );
      }

      await prisma.videoGenerationJob.update({
        where: { id: jobId },
        data: { status: "CANCELLED" }
      });

      await SystemLogger.logActivity({
        action: "VIDEO_CANCELLED",
        entity: "VideoGenerationJob",
        entityId: jobId,
        details: { businessId: job.businessId, provider: job.provider }
      });

      return true;
    } catch (error: any) {
      console.error(`Cancellation failed for job ${jobId}:`, error);
      await SystemLogger.logError({
        message: error.message || "Video cancellation failed",
        source: "VideoService.cancelJob",
        context: { jobId }
      });
      throw new Error(`Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Mock implementations for development
  private static mockGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const jobId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return Promise.resolve({
      jobId,
      status: "pending",
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
    });
  }

  private static mockStatusCheck(job: {
    id: string;
    createdAt: Date | string;
    status: string;
  }): Promise<VideoGenerationResponse> {
    // Simulate progression from pending -> processing -> completed/failed
    const createdTime = new Date(job.createdAt).getTime();
    const elapsed = Date.now() - createdTime;

    let status: "pending" | "processing" | "completed" | "failed" = "pending";
    let videoUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    let error: string | undefined;

    if (elapsed > 30000) { // 30 seconds
      status = "processing";
    }
    if (elapsed > 90000) { // 90 seconds
      // Simulate random failure for testing
      if (Math.random() < 0.2) { // 20% chance of failure
        status = "failed";
        error = "Mock failure for testing";
      } else {
        status = "completed";
        videoUrl = `https://mock-videos.example.com/${job.id}.mp4`;
        thumbnailUrl = `https://mock-videos.example.com/${job.id}_thumb.jpg`;
      }
    }

    return Promise.resolve({
      jobId: job.id,
      status,
      videoUrl,
      thumbnailUrl,
      estimatedCompletion: status === "completed" ? new Date() : undefined,
      error
    });
  }
}

// Extend Prisma schema with video generation job model
// This would typically be in prisma/schema.prisma but included here for completeness
/*
model VideoGenerationJob {
  id            String           @id
  businessId    String
  provider      VideoProvider
  prompt        String
  status        VideoJobStatus
  videoUrl      String?
  thumbnailUrl  String?
  duration      Int
  aspectRatio   String
  quality       String
  createdAt     DateTime         @default(now())
  completedAt   DateTime?
  business      Business         @relation(fields: [businessId], references: [id])

  @@index([businessId, status])
  @@index([createdAt])
}

enum VideoProvider {
  RUNWAY
  LUMA
}

enum VideoJobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
*/