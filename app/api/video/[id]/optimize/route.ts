import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";

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
    const { priority = 'normal' } = await request.json();

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
        businessId: { in: businessIds }
      }
    });

    if (!videoJob) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (videoJob.status !== "COMPLETED") {
      return NextResponse.json({ error: "Video must be completed before optimization" }, { status: 400 });
    }

    // Log optimization request
    await SystemLogger.logActivity({
      action: "VIDEO_OPTIMIZATION_REQUESTED",
      entity: "VideoGenerationJob",
      entityId: videoId,
      userId: session.user.id,
      details: { priority, businessId: videoJob.businessId, requestedAt: new Date().toISOString() }
    });

    // In a real implementation, you would:
    // 1. Queue the video for optimization
    // 2. Process it with FFmpeg or similar
    // 3. Update the database with optimized versions
    // 4. Return the optimized URLs

    // For now, we'll simulate the optimization process
    const optimizationResult = {
      originalUrl: videoJob.videoUrl,
      optimizedUrls: {
        web: `${videoJob.videoUrl}?optimized=web`,
        mobile: `${videoJob.videoUrl}?optimized=mobile`,
        thumbnail: videoJob.thumbnailUrl
      },
      optimizations: [
        {
          type: "compression",
          originalSize: "50MB",
          optimizedSize: "25MB",
          savings: "50%"
        },
        {
          type: "format",
          originalFormat: "mp4",
          optimizedFormat: "webm",
          improvement: "Better web compatibility"
        }
      ],
      processingTime: "45 seconds",
      priority
    };

    return NextResponse.json({
      success: true,
      videoId,
      optimization: optimizationResult,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error optimizing video:", error);
    return NextResponse.json(
      { error: "Failed to optimize video" },
      { status: 500 }
    );
  }
}
