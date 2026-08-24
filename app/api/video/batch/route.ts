import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoIds, options } = await request.json();

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: "Video IDs are required" }, { status: 400 });
    }

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Get all video jobs
    const videoJobs = await prisma.videoGenerationJob.findMany({
      where: {
        id: { in: videoIds },
        businessId: { in: businessIds },
        status: "COMPLETED"
      }
    });

    if (videoJobs.length === 0) {
      return NextResponse.json({ error: "No valid completed videos found" }, { status: 404 });
    }

    // Log batch operation
    await SystemLogger.logActivity({
      action: "VIDEO_BATCH_OPERATION",
      entity: "VideoGenerationJob",
      entityId: videoIds.join(','),
      userId: session.user.id,
      businessId: businessIds[0],
      details: {
        operation: 'batch_download',
        videoCount: videoJobs.length,
        options: options || {}
      }
    });

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create batch download package
    const batchInfo = {
      batchId,
      videos: videoJobs.map(job => ({
        id: job.id,
        url: job.videoUrl,
        thumbnailUrl: job.thumbnailUrl,
        prompt: job.prompt.substring(0, 100), // First 100 chars
        duration: job.duration,
        quality: job.quality,
        createdAt: job.createdAt
      })),
      totalVideos: videoJobs.length,
      options: {
        includeThumbnails: options?.includeThumbnails || false,
        format: options?.format || 'original',
        compression: options?.compression || 'none'
      },
      createdAt: new Date().toISOString(),
      estimatedSize: `${videoJobs.length * 25}MB`, // Rough estimate
      downloadUrl: `/api/video/batch/${batchId}/download`
    };

    // In a real implementation, you would:
    // 1. Create a zip file with all videos
    // 2. Store it temporarily or in cloud storage
    // 3. Return a download URL
    // 4. Clean up after download expires

    return NextResponse.json({
      success: true,
      batch: batchInfo,
      message: `Batch download prepared for ${videoJobs.length} videos`
    });

  } catch (error) {
    console.error("Error creating batch download:", error);
    return NextResponse.json(
      { error: "Failed to create batch download" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batchId = request.nextUrl.searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Validate the batch ID belongs to the user
    // 2. Check if the batch file exists
    // 3. Stream the file or redirect to storage URL
    // 4. Log the download

    // For now, we'll return a placeholder response
    return NextResponse.json({
      error: "Batch download not implemented yet",
      batchId,
      message: "This endpoint would serve the actual batch download file"
    }, { status: 501 });

  } catch (error) {
    console.error("Error serving batch download:", error);
    return NextResponse.json(
      { error: "Failed to serve batch download" },
      { status: 500 }
    );
  }
}
