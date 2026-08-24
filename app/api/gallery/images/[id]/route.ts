import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";

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

    const { id: imageId } = await params;

    // Get the active workspace/business ID
    const businessId = await getActiveWorkspaceIdSafe();

    // Find and verify ownership of the image job
    // Support both businessId and userId for backward compatibility
    const whereClause = businessId
      ? { id: imageId, businessId }
      : { id: imageId, userId: session.user.id };

    const imageJob = await prisma.imageGenerationJob.findFirst({
      where: whereClause
    });

    if (!imageJob) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete the image job
    await prisma.imageGenerationJob.delete({
      where: { id: imageId }
    });

    // Log the deletion
    await SystemLogger.logActivity({
      action: "IMAGE_DELETED",
      entity: "ImageGenerationJob",
      userId: session.user.id,
      details: { imageId, businessId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
