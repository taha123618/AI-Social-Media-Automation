import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";
import axios from 'axios';

interface VideoQualityCheck {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  metrics?: {
    resolution?: { width: number; height: number };
    duration?: number;
    fileSize?: number;
    bitrate?: number;
    format?: string;
  };
}

interface QualityValidationOptions {
  checkResolution?: boolean;
  checkDuration?: boolean;
  checkFileSize?: boolean;
  checkBitrate?: boolean;
  maxFileSizeMB?: number;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  requiredResolution?: { width: number; height: number };
}

const DEFAULT_OPTIONS: QualityValidationOptions = {
  checkResolution: true,
  checkDuration: true,
  checkFileSize: true,
  checkBitrate: false, // Expensive operation, optional
  maxFileSizeMB: 500, // 500MB max
  minDurationSeconds: 1,
  maxDurationSeconds: 120, // 2 minutes max
  requiredResolution: { width: 720, height: 720 } // Minimum 720p
};

async function validateVideoQuality(
  videoUrl: string,
  options: QualityValidationOptions = DEFAULT_OPTIONS
): Promise<VideoQualityCheck> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const metrics: VideoQualityCheck['metrics'] = {};

  try {
    // Fetch video metadata (HEAD request to get file size)
    const headResponse = await axios.head(videoUrl, { timeout: 10000 });
    const contentLength = headResponse.headers['content-length'];

    if (contentLength && options.checkFileSize) {
      const fileSizeMB = Number(contentLength) / (1024 * 1024);
      metrics.fileSize = fileSizeMB;

      if (fileSizeMB > (options.maxFileSizeMB || 500)) {
        issues.push(`File size too large: ${fileSizeMB.toFixed(2)}MB (max: ${options.maxFileSizeMB}MB)`);
        recommendations.push('Consider compressing the video or using a lower quality setting');
      }
    }

    // For more detailed analysis, you would need to:
    // 1. Download a portion of the video
    // 2. Use FFmpeg to analyze the video
    // 3. Extract metadata like resolution, duration, bitrate

    // This is a simplified validation based on URL and available headers
    // In a production environment, you'd implement FFmpeg-based analysis

    const urlParams = new URL(videoUrl);
    const pathSegments = urlParams.pathname.split('.');
    const format = pathSegments[pathSegments.length - 1]?.toLowerCase();
    metrics.format = format;

    if (!['mp4', 'webm', 'mov', 'avi'].includes(format)) {
      issues.push(`Unsupported video format: ${format}`);
      recommendations.push('Convert video to MP4 format for better compatibility');
    }

    // Duration check would require video analysis
    // For now, we'll estimate based on file size if we have it
    if (contentLength && options.checkDuration) {
      // Rough estimate: 1MB ≈ 5 seconds at 720p (very rough approximation)
      const estimatedDuration = (Number(contentLength) / (1024 * 1024)) * 5;
      metrics.duration = estimatedDuration;

      if (options.minDurationSeconds && estimatedDuration < options.minDurationSeconds) {
        issues.push(`Video too short: estimated ${estimatedDuration.toFixed(1)}s (min: ${options.minDurationSeconds}s)`);
        recommendations.push('Generate a longer video for better engagement');
      }

      if (options.maxDurationSeconds && estimatedDuration > options.maxDurationSeconds) {
        issues.push(`Video too long: estimated ${estimatedDuration.toFixed(1)}s (max: ${options.maxDurationSeconds}s)`);
        recommendations.push('Consider shortening the video for better performance');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
      metrics
    };

  } catch (error) {
    return {
      isValid: false,
      issues: ['Failed to analyze video'],
      recommendations: ['Check video URL and try again'],
      metrics
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;
    const validationOptions: QualityValidationOptions = await request.json();

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Get video job
    const videoJob = await prisma.videoGenerationJob.findFirst({
      where: {
        id: videoId,
        businessId: { in: businessIds },
        status: "COMPLETED"
      }
    });

    if (!videoJob) {
      return NextResponse.json({ error: "Video not found or not completed" }, { status: 404 });
    }

    if (!videoJob.videoUrl) {
      return NextResponse.json({ error: "No video URL available" }, { status: 400 });
    }

    // Validate video quality
    const qualityCheck = await validateVideoQuality(videoJob.videoUrl, {
      ...DEFAULT_OPTIONS,
      ...validationOptions
    });

    // Log quality check results
    await SystemLogger.logActivity({
      action: "VIDEO_QUALITY_CHECK",
      entity: "VideoGenerationJob",
      entityId: videoId,
      userId: session.user.id,
      details: {
        businessId: videoJob.businessId,
        isValid: qualityCheck.isValid,
        issueCount: qualityCheck.issues.length,
        metrics: qualityCheck.metrics
      }
    });

    // If quality issues are found, you could automatically trigger optimization
    if (!qualityCheck.isValid && qualityCheck.issues.length > 0) {
      // Log for potential automatic optimization
      console.warn(`Video ${videoId} has quality issues:`, qualityCheck.issues);
    }

    return NextResponse.json({
      videoId,
      qualityCheck,
      videoUrl: videoJob.videoUrl,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error validating video quality:", error);
    return NextResponse.json(
      { error: "Failed to validate video quality" },
      { status: 500 }
    );
  }
}

// GET endpoint for quick quality check (no options)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Get video job
    const videoJob = await prisma.videoGenerationJob.findFirst({
      where: {
        id: videoId,
        businessId: { in: businessIds },
        status: "COMPLETED"
      }
    });

    if (!videoJob) {
      return NextResponse.json({ error: "Video not found or not completed" }, { status: 404 });
    }

    if (!videoJob.videoUrl) {
      return NextResponse.json({ error: "No video URL available" }, { status: 400 });
    }

    // Quick quality check with default options
    const qualityCheck = await validateVideoQuality(videoJob.videoUrl);

    return NextResponse.json({
      videoId,
      qualityCheck,
      videoUrl: videoJob.videoUrl,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in quick quality check:", error);
    return NextResponse.json(
      { error: "Failed to perform quality check" },
      { status: 500 }
    );
  }
}
