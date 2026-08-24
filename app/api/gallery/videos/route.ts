import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    if (businessIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch video generation jobs from the database
    const videos = await prisma.videoGenerationJob.findMany({
      where: {
        businessId: { in: businessIds },
        status: "COMPLETED",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        prompt: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        aspectRatio: true,
        quality: true,
        status: true,
        provider: true,
        createdAt: true,
        completedAt: true,
        error: true,
        businessId: true // Include businessId in response
      }
    });

    // Log gallery access
    await SystemLogger.logActivity({
      action: "VIDEO_GALLERY_ACCESSED",
      entity: "Gallery",
      userId: session.user.id,
      details: { videoCount: videos.length }
    });

    return NextResponse.json(videos);

  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
