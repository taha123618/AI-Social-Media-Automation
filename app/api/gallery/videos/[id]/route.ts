import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";

export async function DELETE(
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

    // Get user's businesses to verify ownership
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    if (businessIds.length === 0) {
      return NextResponse.json({ error: "No businesses found" }, { status: 404 });
    }

    // Find and delete the video job
    const videoJob = await prisma.videoGenerationJob.findFirst({
      where: {
        id: videoId,
        businessId: { in: businessIds }
      }
    });

    if (!videoJob) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Delete the video job
    await prisma.videoGenerationJob.delete({
      where: { id: videoId }
    });

    // Log the deletion
    await SystemLogger.logActivity({
      action: "VIDEO_DELETED",
      entity: "VideoGenerationJob",
      userId: session.user.id,
      details: { videoId, businessId: videoJob.businessId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
