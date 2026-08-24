import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ImageService } from '@/features/image_generation/services/image.service';
import { ImageGenerationWorker } from '@/features/image_generation/workers/image-generation.worker';
import { ImageGenerationRequestSchema, IMAGE_TYPES } from '@/features/image_generation/types';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = ImageGenerationRequestSchema.parse(body);

    console.log(`[API] Brand-aware image generation request:`, {
      businessId: validatedRequest.businessId,
      userId: validatedRequest.userId,
      brandId: validatedRequest.brandId,
      imageType: validatedRequest.imageType,
      colors: validatedRequest.colors,
      prompt: validatedRequest.prompt?.substring(0, 100) + '...'
    });

    await SystemLogger.logActivity({
      action: "IMAGE_GENERATION_REQUESTED",
      entity: "Image",
      userId: validatedRequest.userId,
      details: {
        businessId: validatedRequest.businessId,
        imageType: validatedRequest.imageType,
        prompt: validatedRequest.prompt?.substring(0, 200)
      }
    });

    // Dispatch to ImageService to create the job and handle queueing
    // Note: If Runway API key is missing, it will use mock mode
    const result = await ImageService.queueGenerationJob(validatedRequest);

    // Queue the job using ImageGenerationWorker for processing
    const worker = new ImageGenerationWorker();
    await worker.addGenerationJob({
      ...validatedRequest,
      jobId: result.jobId,
      prompt: validatedRequest.prompt || "Image generation"
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[API] Brand-aware image generation error:', error);

    await SystemLogger.logError({
      message: error.message || "Image generation request failed",
      source: "app/api/image/generate/route.ts",
      path: "/api/image/generate",
      stack: error.stack,
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'types') {
      // Return available image types
      return NextResponse.json({
        success: true,
        data: IMAGE_TYPES
      });
    }

    if (action === 'models') {
      // Return available AI models
      return NextResponse.json({
        success: true,
        data: ImageService.getAIModels()
      });
    }

    if (action === 'brands') {
      // Return available brands (mock implementation)
      const brands = [
        {
          id: 'default',
          name: 'Default Brand',
          colors: ['#3B82F6', '#2563EB', '#FFFFFF', '#000000'],
          style: 'professional'
        },
        {
          id: 'modern',
          name: 'Modern Brand',
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
          style: 'minimal'
        }
      ];

      return NextResponse.json({
        success: true,
        data: brands
      });
    }

    if (action === 'styles') {
      const styles = {
        realistic: 'Photorealistic, highly detailed, professional photography',
        artistic: 'Creative, expressive, painterly style',
        cinematic: 'Movie-like quality, dramatic lighting, composition',
        anime: 'Japanese animation style, manga art style',
        cartoon: 'Animated style, colorful and fun',
        '3d': 'Three-dimensional render, CGI, digital art'
      };

      return NextResponse.json({
        success: true,
        data: { styles }
      });
    }

    if (action === 'aspect-ratios') {
      const aspectRatios = {
        '1:1': { name: 'Square', width: 1024, height: 1024, description: 'Perfect for social media posts' },
        '16:9': { name: 'Landscape', width: 1920, height: 1080, description: 'Wide format for videos and banners' },
        '9:16': { name: 'Portrait', width: 1080, height: 1920, description: 'Tall format for stories' },
        '4:3': { name: 'Landscape', width: 1600, height: 1200, description: 'Standard landscape' },
        '3:2': { name: 'Portrait', width: 1200, height: 800, description: 'Standard portrait' },
        '2:3': { name: 'Landscape', width: 1200, height: 1800, description: 'Wide landscape format' },
        '3:4': { name: 'Portrait', width: 1024, height: 1365, description: 'Three-quarter portrait' },
        '4:5': { name: 'Portrait', width: 1024, height: 1280, description: 'Social media portrait' },
        '5:4': { name: 'Landscape', width: 1280, height: 1024, description: 'Social media landscape' }
      };

      return NextResponse.json({
        success: true,
        data: { aspectRatios }
      });
    }

    if (action === 'quality-levels') {
      const qualityLevels = {
        standard: { name: 'Standard', description: 'Good quality, faster generation', time: '~10s' },
        high: { name: 'High', description: 'Better quality, moderate time', time: '~20s' },
        ultra: { name: 'Ultra', description: 'Best quality, slower generation', time: '~40s' }
      };

      return NextResponse.json({
        success: true,
        data: { qualityLevels }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action parameter'
    }, { status: 400 });

  } catch (error) {
    console.error('[API] Image generation info error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
