import { z } from "zod";

// Enums
export enum VideoProvider {
  RUNWAY = "RUNWAY",
  LUMA = "LUMA"
}

export enum VideoJobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export enum BrandTone {
  PROFESSIONAL = "PROFESSIONAL",
  FRIENDLY = "FRIENDLY",
  CREATIVE = "CREATIVE",
  TECHNICAL = "TECHNICAL",
  LUXURY = "LUXURY",
  CASUAL = "CASUAL"
}

// Zod schemas for validation
export const VideoGenerationRequestSchema = z.object({
  businessId: z.string().optional(), // Optional on frontend, required on backend route
  visualPrompt: z.string().max(2000, "Visual prompt is too long").optional(),
  promptImage: z.string().url("If provided, image must be a valid URL").optional().or(z.literal("")),
  videoUri: z.string().url("If provided, source video must be a valid URL").optional().or(z.literal("")),
  contentType: z.enum(["text_to_reel", "image_to_360", "image_to_vfx", "image_to_ugc", "image_to_commercial", "video_to_video"]).default("text_to_reel").optional(),
  style: z.enum(["realistic", "cinematic", "animated", "artistic", "friendly", "professional"]).optional(),
  duration: z.number().min(1, "Duration must be at least 1s").max(60, "Duration cannot exceed 60s").default(5),
  aspectRatio: z.string().default("1280:720"),
  quality: z.enum(["standard", "hd", "4k"]).default("hd"),
  model: z.enum(["gen4.5", "gen4_turbo", "gen4_aleph", "act_two", "veo3", "veo3.1", "veo3.1_fast"]).default("gen4.5"),
  workflowId: z.string().optional(),
  executionId: z.string().optional(),
}).refine((data) => {
  // If Text-to-Reel: must have visualPrompt
  if (data.contentType === 'text_to_reel') {
    return !!data.visualPrompt?.trim();
  }
  // If Video-to-Video: must have videoUri
  if (data.contentType === 'video_to_video') {
    return !!data.videoUri?.trim();
  }
  // If Image-to-Video: must have promptImage (or at least a visualPrompt if image is somehow missing but prompt exists)
  // Per user request: prompt is optional if image is there.
  return !!data.promptImage?.trim() || !!data.visualPrompt?.trim();
}, {
  message: "Please provide the required asset (image/video) or a visual prompt for this generation mode",
  path: ["visualPrompt"]
});

export type VideoGenerationRequestInput = z.infer<typeof VideoGenerationRequestSchema>;

export const VideoGenerationResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  estimatedCompletion: z.date().optional(),
  error: z.string().optional(),
});

export const BrandFilterOptionsSchema = z.object({
  addWatermark: z.boolean().optional(),
  applyColorGrade: z.boolean().optional(),
  resizeForPlatform: z.enum(["instagram", "tiktok", "youtube", "linkedin", "facebook"]).optional(),
});

// Type inference
export type VideoGenerationRequest = z.infer<typeof VideoGenerationRequestSchema>;
export type VideoGenerationResponse = z.infer<typeof VideoGenerationResponseSchema>;
export type BrandFilterOptions = z.infer<typeof BrandFilterOptionsSchema>;

// Database model types (matching Prisma schema)
export interface VideoGenerationJob {
  id: string;
  businessId: string;
  provider: VideoProvider;
  prompt: string;
  status: VideoJobStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

// API Response Types
export interface VideoJobApiResponse {
  id: string;
  businessId: string;
  provider: string;
  prompt: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface VideoJobsListResponse {
  jobs: VideoJobApiResponse[];
  totalCount: number;
}

// Integration with RAG Pipeline
export interface RagVideoRequest {
  contentType: string; // "product demo", "testimonial", "explainer", etc.
  targetAudience?: string;
  tone?: keyof typeof BrandTone;
  customInstructions?: string;
  platform?: string; // for resizing
  duration?: number;
  quality?: string;
  model?: string;
}

export interface VideoJob {

  id: string;
  businessId: string;
  provider: string;
  prompt: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface WorkerStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}
export interface VideoStatusResponse {
  jobId: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  estimatedCompletion?: string;
}