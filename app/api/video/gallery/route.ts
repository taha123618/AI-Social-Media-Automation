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

    // Get businessId from query params for additional filtering
    const { searchParams } = new URL(request.url);
    const queryBusinessId = searchParams.get('businessId');

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    const businessIds = userBusinesses.map(ub => ub.businessId);

    // If specific businessId is provided, validate user has access
    if (queryBusinessId && !businessIds.includes(queryBusinessId)) {
      return NextResponse.json({ error: "Unauthorized access to business" }, { status: 403 });
    }

    // Filter by specific business if provided, otherwise all user businesses
    const targetBusinessIds = queryBusinessId ? [queryBusinessId] : businessIds;

    if (targetBusinessIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch all video generation jobs for target businesses
    const videos = await prisma.videoGenerationJob.findMany({
      where: {
        businessId: { in: targetBusinessIds }
      },
      orderBy: { createdAt: "desc" },
      take: 100 // Limit to 100 most recent videos
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
