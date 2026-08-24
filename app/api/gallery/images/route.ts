import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the active workspace/business ID
    const businessId = await getActiveWorkspaceIdSafe();

    // Fetch image generation jobs from the database
    // Support both businessId and userId for backward compatibility
    const whereClause: any = businessId
      ? { businessId, status: "COMPLETED", imageUrl: { not: null } }
      : { userId: session.user.id, status: "COMPLETED", imageUrl: { not: null } };

    const images = await prisma.imageGenerationJob.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        model: true,
        aspectRatio: true
      }
    });

    // Transform data to match expected format
    const transformedImages = images.map(img => {
      // Extract format from URL or default to jpg
      const formatMatch = img.imageUrl?.match(/\.(jpg|jpeg|png|webp|gif)(?:\?|$)/i);
      const format = formatMatch ? formatMatch[1].toLowerCase() : "jpg";

      return {
        id: img.id,
        url: img.imageUrl,
        title: img.prompt,
        createdAt: img.createdAt,
        size: 0, // We'll need to add this field to the schema if needed
        format: format,
        model: img.model,
        aspectRatio: img.aspectRatio
      };
    });

    // Log gallery access
    await SystemLogger.logActivity({
      action: "IMAGE_GALLERY_ACCESSED",
      entity: "Gallery",
      userId: session.user.id,
      details: { imageCount: transformedImages.length, businessId }
    });

    return NextResponse.json(transformedImages);

  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
