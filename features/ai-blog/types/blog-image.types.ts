export interface ImageRecord {
  id: string;
  url: string;
  thumbUrl?: string;
  alt: string;
  keywords: string[];
  width?: number;
  height?: number;
  photographer?: string;
  source?: "unsplash" | "pexels" | "pixabay" | "static" | "ai-generated";
  aiPrompt?: string;
  revisedPrompt?: string;
  aiModel?: string;
}

export interface SectionImageMatch {
  image: ImageRecord;
  relevanceScore: number;
  matchType: "exact" | "keyword" | "category" | "fallback";
  sectionHeading: string;
  sectionIndex: number;
}

export type ImageAspectRatio = "16:9" | "4:3" | "1:1" | "3:2";
export type ImageStyle = "standard" | "hero" | "wide" | "inline";

export interface ImagePlacementConfig {
  aspectRatio: ImageAspectRatio;
  imageStyle: ImageStyle;
  maxImagesPerSection: number;
  enableCaptions: boolean;
  enableOverlay: boolean;
}

export const DEFAULT_IMAGE_CONFIG: ImagePlacementConfig = {
  aspectRatio: "16:9",
  imageStyle: "standard",
  maxImagesPerSection: 1,
  enableCaptions: true,
  enableOverlay: false,
};

export interface ContextImageProps {
  image: ImageRecord | null;
  alt: string;
  aspectRatio?: ImageAspectRatio;
  imageStyle?: ImageStyle;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
}

export interface ImageProvider {
  name: string;
  search(query: string, count?: number): Promise<ImageRecord[]>;
  getById?(id: string): Promise<ImageRecord | null>;
}
