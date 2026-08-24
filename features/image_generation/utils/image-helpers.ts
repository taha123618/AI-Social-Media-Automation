import { BrandConfig, ImageTypeConfig } from '../types';
export type { BrandConfig, ImageTypeConfig };

export interface ImageGenerationOptions {
  model: string;
  style: string;
  aspectRatio: string;
  quality: string;
  variations: number;
}

export const DEFAULT_IMAGE_OPTIONS: ImageGenerationOptions = {
  model: 'dall-e-3',
  style: 'realistic',
  aspectRatio: '1:1',
  quality: 'standard',
  variations: 1
};

export const AI_MODELS = {
  openai: {
    'dall-e-3': 'DALL-E 3 (Best Quality)',
    'dall-e-2': 'DALL-E 2 (Faster)',
    'gpt-4o': 'GPT-4o (Accurate Text & Visuals)'
  },
  stability: {
    'stable-diffusion-xl': 'Stable Diffusion XL',
    'stable-diffusion-v2': 'Stable Diffusion v2'
  },
  google: {
    'gemini-2.0-flash-lite-001': 'Google Gemini 2.0 Flash Lite',
    'google-nano-banana': 'Google Nano Banana (Overall Best)'
  },
  flux: {
    'flux-pro': 'FLUX.1 Pro',
    'flux-schnell': 'FLUX.1 Schnell'
  },
  ideogram: {
    'ideogram-v2': 'Ideogram v2'
  }
};

export const IMAGE_STYLES = {
  realistic: 'Realistic - Photorealistic images',
  artistic: 'Artistic - Creative and expressive',
  cinematic: 'Cinematic - Movie-like quality',
  anime: 'Anime - Japanese animation style',
  cartoon: 'Cartoon - Animated style',
  '3d': '3D Render - Three-dimensional'
};

export const ASPECT_RATIOS = {
  '1:1': 'Square (1:1)',
  '16:9': 'Landscape (16:9)',
  '9:16': 'Portrait (9:16)',
  '4:3': 'Landscape (4:3)',
  '3:2': 'Portrait (3:2)',
  '2:3': 'Landscape (2:3)',
  '3:4': 'Portrait (3:4)',
  '4:5': 'Portrait (4:5)',
  'z-fold-brochure': 'Z-Fold Brochure (9:16)'
};

export const QUALITY_LEVELS = {
  standard: 'Standard - Good quality',
  high: 'High - Better quality',
  ultra: 'Ultra - Best quality (slower)'
};

export const PREDEFINED_BRANDS: BrandConfig[] = [
  {
    id: 'techcorp',
    name: 'TechCorp',
    colors: ['#3B82F6', '#10B981', '#FFFFFF', '#1F2937'],
    style: 'professional'
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    colors: ['#FF6B6B', '#4ECDC4', '#F3E5F1', '#FFE66D'],
    style: 'artistic'
  },
  {
    id: 'modern-brand',
    name: 'Modern Brand',
    colors: ['#000000', '#FFFFFF', '#808080', '#6B7280'],
    style: 'minimal'
  },
  {
    id: 'nature-co',
    name: 'Nature Co',
    colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    style: 'natural'
  },
  {
    id: 'luxury-brand',
    name: 'Luxury Brand',
    colors: ['#7C3AED', '#EC4899', '#F59E0B', '#FBBF24'],
    style: 'elegant'
  }
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getAspectRatioDimensions(aspectRatio: string): { width: number; height: number } {
  const ratioMap: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    '3:2': { width: 1200, height: 800 },
    '2:3': { width: 1200, height: 1800 },
    '3:4': { width: 1024, height: 1365 },
    '4:5': { width: 1024, height: 1280 },
    '5:4': { width: 1280, height: 1024 },
    'z-fold-brochure': { width: 1080, height: 1920 }
  };

  return ratioMap[aspectRatio] || ratioMap['1:1'];
}

export function validateImagePrompt(prompt: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt is required');
  }

  if (prompt.length < 3) {
    errors.push('Prompt must be at least 3 characters long');
  }

  if (prompt.length > 1000) {
    errors.push('Prompt must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function generateImageFilename(prompt: string, jobId: string): string {
  const cleanPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 20);
  return `image-${jobId}-${cleanPrompt.replace(/\s+/g, '-').toLowerCase()}.png`;
}

export function getBrandColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#00FF00',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'orange': '#FFA500',
    'pink': '#FFC0CB',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'grey': '#808080',
    'brown': '#964B00',
    'navy': '#000080',
    'teal': '#008080',
    'cyan': '#00FFFF',
    'lime': '#00FF00',
    'indigo': '#4B0082',
    'violet': '#8B008B'
  };

  return colorMap[colorName.toLowerCase()] || colorName;
}

export function createBrandPrompt(
  basePrompt: string,
  brand: BrandConfig,
  imageType: string,
  primaryColor?: string,
  secondaryColor?: string
): string {
  const colors = [primaryColor || brand.colors[0], secondaryColor || brand.colors[1]]
    .filter(Boolean)
    .join(' and ');

  return `${basePrompt}. ${brand.name} brand colors: ${colors}. ${brand.style} style. Perfect for ${imageType}.`;
}

export function estimateGenerationTime(
  model: string,
  quality: string,
  variations: number
): number {
  const baseTime = 10; // Base time in seconds

  let modelMultiplier = 1;
  if (model.includes('dall-e-3')) modelMultiplier = 1.5;
  if (model.includes('dall-e-2')) modelMultiplier = 0.8;
  if (model.includes('stable-diffusion')) modelMultiplier = 1.2;

  let qualityMultiplier = 1;
  if (quality === 'high') qualityMultiplier = 1.3;
  if (quality === 'ultra') qualityMultiplier = 1.8;

  const variationMultiplier = 1 + (variations - 1) * 0.3;

  return Math.round(baseTime * modelMultiplier * qualityMultiplier * variationMultiplier);
}
