import { z } from "zod";

export const ImageGenerationRequestSchema = z.object({
  businessId: z.string().optional(),
  userId: z.string().nullish().transform(v => v ?? undefined),
  prompt: z.string().max(4000, "Prompt must be less than 4000 characters").optional(),
  referenceImage: z.string().url().optional(),
  style: z.enum(["realistic", "artistic", "cinematic", "anime", "cartoon", "3d"]),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:2", "2:3", "3:4", "4:5", "5:4"]),
  quality: z.enum(["standard", "hd", "ultra"]),
  model: z.enum(["dall-e-3", "dall-e-2", "stable-diffusion", "midjourney", "openai", "google-nano", "google-nano-banana", "flux", "ideogram", "runway-gen4-image", "runway-gen4-image-turbo", "gemini_2.5_flash", "gemini_3_pro"]),
  variations: z.number().min(1).max(4),
  brandId: z.string().nullish().transform(v => v ?? undefined),
  includeBrand: z.boolean().optional(),
  colors: z.array(z.string()).optional(),
  imageType: z.enum(["custom", "facebook-post", "facebook-ad", "facebook-cover", "youtube-thumbnail", "youtube-banner", "youtube-shorts", "instagram-post", "instagram-story", "z-fold-brochure", "brochure", "poster", "banner", "cards"]).nullish().transform(v => v ?? undefined).optional(),
  workflowId: z.string().optional(),
  executionId: z.string().optional(),
}).refine((data) => data.businessId || data.userId, {
  message: "Either businessId or userId is required",
  path: ["businessId"],
}).refine((data) => data.prompt?.trim() || data.referenceImage?.trim(), {
  message: "Please enter a prompt or upload a reference image",
  path: ["prompt"],
});

export type ImageGenerationRequestInput = z.infer<typeof ImageGenerationRequestSchema>;

export const ImageGenerationResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  imageUrl: z.string().url().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const BrandFilterOptionsSchema = z.object({
  addWatermark: z.boolean().optional(),
  applyColorGrade: z.boolean().optional(),
  resizeForPlatform: z.enum(["instagram", "tiktok", "youtube", "linkedin", "facebook"]).optional(),
});

export type BrandFilterOptions = z.infer<typeof BrandFilterOptionsSchema>;

export interface ImageGenerationQueueJob {
  jobId: string;
  businessId?: string;
  userId?: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
  model?: string;
  variations?: number;
  referenceImage?: string;
  brandId?: string;
  colors?: string[];
  imageType?: string;
  providerJobId?: string;
}

export interface ImageGenerationJob {
  model: string;
  id: string;
  businessId?: string;
  userId?: string;
  provider: string;
  prompt: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  imageUrl?: string;
  thumbnailUrl?: string;
  aspectRatio: string;
  quality: string;
  style: string;
  providerJobId?: string;
  variations: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  brandId?: string;
  colors?: string[];
  imageType?: string;
}

export type ImageGenerationResponse = z.infer<typeof ImageGenerationResponseSchema>;

export interface BrandConfig {
  id: string;
  name: string;
  colors: string[];
  style: 'professional' | 'artistic' | 'minimal' | 'natural' | 'elegant';
  logo?: string;
  fonts?: string[];
  guidelines?: string;
}

export interface ImageTypeConfig {
  id: string;
  name: string;
  aspectRatio: string;
  dimensions: { width: number; height: number };
  description: string;
  platform: string;
  useCase: string;
}

export const IMAGE_TYPES: Record<string, ImageTypeConfig> = {
  "custom": {
    id: "custom",
    name: "Custom",
    aspectRatio: "1:1",
    dimensions: { width: 1024, height: 1024 },
    description: "Custom image for any purpose",
    platform: "general",
    useCase: "General purpose custom images"
  },
  "facebook-post": {
    id: "facebook-post",
    name: "Facebook Post",
    aspectRatio: "1:1",
    dimensions: { width: 1080, height: 1080 },
    description: "Square image for Facebook posts",
    platform: "facebook",
    useCase: "Social media post image"
  },
  "facebook-ad": {
    id: "facebook-ad",
    name: "Facebook Ad",
    aspectRatio: "1:1",
    dimensions: { width: 1200, height: 1200 },
    description: "Square image for Facebook ads",
    platform: "facebook",
    useCase: "Advertisement image"
  },
  "facebook-cover": {
    id: "facebook-cover",
    name: "Facebook Cover",
    aspectRatio: "16:9",
    dimensions: { width: 1200, height: 675 },
    description: "Cover image for Facebook pages",
    platform: "facebook",
    useCase: "Page cover image"
  },
  "youtube-thumbnail": {
    id: "youtube-thumbnail",
    name: "YouTube Thumbnail",
    aspectRatio: "16:9",
    dimensions: { width: 1280, height: 720 },
    description: "Thumbnail for YouTube videos",
    platform: "youtube",
    useCase: "Video thumbnail"
  },
  "youtube-banner": {
    id: "youtube-banner",
    name: "YouTube Banner",
    aspectRatio: "16:9",
    dimensions: { width: 2560, height: 1440 },
    description: "Channel banner for YouTube",
    platform: "youtube",
    useCase: "Channel banner"
  },
  "youtube-shorts": {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    aspectRatio: "9:16",
    dimensions: { width: 1080, height: 1920 },
    description: "Vertical image for YouTube Shorts",
    platform: "youtube",
    useCase: "Short-form video thumbnail"
  },
  "instagram-post": {
    id: "instagram-post",
    name: "Instagram Post",
    aspectRatio: "1:1",
    dimensions: { width: 1080, height: 1080 },
    description: "Square image for Instagram posts",
    platform: "instagram",
    useCase: "Social media post image"
  },
  "instagram-story": {
    id: "instagram-story",
    name: "Instagram Story",
    aspectRatio: "9:16",
    dimensions: { width: 1080, height: 1920 },
    description: "Vertical image for Instagram Stories",
    platform: "instagram",
    useCase: "Story image"
  },
  "z-fold-brochure": {
    id: "z-fold-brochure",
    name: "Z-Fold Brochure",
    aspectRatio: "9:16",
    dimensions: { width: 1080, height: 1920 },
    description: "Triple-fold brochure layout",
    platform: "print",
    useCase: "Marketing material"
  },
  "brochure": {
    id: "brochure",
    name: "Brochure",
    aspectRatio: "2:3",
    dimensions: { width: 1200, height: 1800 },
    description: "Standard brochure layout",
    platform: "print",
    useCase: "Marketing material"
  },
  "poster": {
    id: "poster",
    name: "Poster",
    aspectRatio: "2:3",
    dimensions: { width: 1200, height: 1800 },
    description: "Large format poster",
    platform: "print",
    useCase: "Event promotion"
  },
  "banner": {
    id: "banner",
    name: "Banner",
    aspectRatio: "16:9",
    dimensions: { width: 1920, height: 1080 },
    description: "Web or event banner",
    platform: "web",
    useCase: "Branding"
  },
  "cards": {
    id: "cards",
    name: "Cards",
    aspectRatio: "1:1",
    dimensions: { width: 800, height: 800 },
    description: "Business or social cards",
    platform: "print",
    useCase: "Networking"
  }
};

export const AI_MODELS = {
  openai: {
    accurate: "gpt-4o",
    visual: "dall-e-3",
    nano: "dall-e-2"
  },
  google: {
    nano: "gemini-2.0-flash-lite-001",
    banana: "gemini-2.0-flash-lite-preview-001"
  },
  ideogram: {
    v2: "ideogram-v2"
  },
  flux: {
    pro: "flux-pro"
  },
  runway: {
    gen4_image: "runway-gen4-image",
    gen4_image_turbo: "runway-gen4-image-turbo",
    gemini_flash: "gemini_2.5_flash"
  }
} as const;
