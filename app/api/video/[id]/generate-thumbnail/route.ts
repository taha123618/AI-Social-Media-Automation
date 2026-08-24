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

    if (!video.videoUrl) {
      return NextResponse.json({ error: "No video URL available" }, { status: 400 });
    }

    // For now, we'll create a simple thumbnail using a data URL
    // In a real implementation, you would use a proper video processing library
    // like FFmpeg to extract frames from the video

    // Create a simple gradient thumbnail as fallback
    const canvasWidth = 640;
    const canvasHeight = 360;

    // Generate a simple SVG thumbnail based on the video ID
    const colors = [
      ['#3B82F6', '#8B5CF6'], // Blue to Purple
      ['#10B981', '#3B82F6'], // Green to Blue
      ['#F59E0B', '#EF4444'], // Orange to Red
      ['#8B5CF6', '#EC4899'], // Purple to Pink
    ];

    const colorPair = colors[video.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length];

    const svgThumbnail = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <circle cx="${canvasWidth / 2}" cy="${canvasHeight / 2}" r="40" fill="white" opacity="0.3"/>
        <polygon points="${canvasWidth / 2 - 15},${canvasHeight / 2 - 20} ${canvasWidth / 2 + 20},${canvasHeight / 2} ${canvasWidth / 2 - 15},${canvasHeight / 2 + 20}" fill="white" opacity="0.8"/>
      </svg>
    `;

    const thumbnailDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgThumbnail).toString('base64')}`;

    // Update the video with the generated thumbnail
    const updatedVideo = await prisma.videoGenerationJob.update({
      where: { id: videoId },
      data: { thumbnailUrl: thumbnailDataUrl }
    });

    // Log thumbnail generation
    await SystemLogger.logActivity({
      action: "VIDEO_THUMBNAIL_GENERATED",
      entity: "VideoGenerationJob",
      entityId: videoId,
      userId: session.user.id,
      details: { provider: video.provider, method: "server-side" }
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      thumbnailUrl: thumbnailDataUrl
    });

  } catch (error) {
    console.error("Error generating video thumbnail:", error);
    return NextResponse.json(
      { error: "Failed to generate thumbnail" },
      { status: 500 }
    );
  }
}
