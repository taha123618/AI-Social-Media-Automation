import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";

export async function PUT(
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
    const body = await request.json();
    const { thumbnailUrl } = body;

    if (!thumbnailUrl) {
      return NextResponse.json({ error: "Thumbnail URL is required" }, { status: 400 });
    }

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // Check if video exists and belongs to user's business
    const video = await prisma.videoGenerationJob.findFirst({
      where: {
        id: videoId,
        businessId: { in: businessIds }
      }
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Update the video with thumbnail
    const updatedVideo = await prisma.videoGenerationJob.update({
      where: { id: videoId },
      data: { thumbnailUrl }
    });

    // Log thumbnail update
    await SystemLogger.logActivity({
      action: "VIDEO_THUMBNAIL_UPDATED",
      entity: "VideoGenerationJob",
      entityId: videoId,
      userId: session.user.id,
      details: { provider: video.provider }
    });

    return NextResponse.json({ success: true, video: updatedVideo });

  } catch (error) {
    console.error("Error updating video thumbnail:", error);
    return NextResponse.json(
      { error: "Failed to update thumbnail" },
      { status: 500 }
    );
  }
}
