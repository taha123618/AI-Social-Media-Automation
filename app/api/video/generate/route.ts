import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/features/video_generation/services/video.service";
import { VideoGenerationRequestSchema } from "@/features/video_generation/types";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required in headers" }, { status: 400 });
    }

    const body = await request.json();

    // Validate request
    const validatedRequest = VideoGenerationRequestSchema.parse({
      ...body,
      businessId
    });

    // Generate video
    const result = await VideoService.generateWithRunway(validatedRequest);

    await SystemLogger.logActivity({
      action: 'VIDEO_GENERATION_STARTED',
      entity: 'VideoJob',
      entityId: (result as any)?.jobId || (result as any)?.id,
      userId: session.user.id,
      details: { businessId },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Video generation error:", error);

    // Handle specific prompt limit errors
    let errorMessage = error instanceof Error ? error.message : 'Unknown video generation error';
    let statusCode = 500;

    if (errorMessage.includes('truncated to 800 characters')) {
      errorMessage = `Your prompt was too long and has been truncated to 800 characters. Please try with a shorter prompt for better results.`;
      statusCode = 400;
    } else if (errorMessage.includes('Validation of body failed')) {
      errorMessage = `Invalid video generation parameters. Please check your input and try again.`;
      statusCode = 400;
    } else if (errorMessage.includes('Runway API failed')) {
      errorMessage = `Video generation service is temporarily unavailable. Please try again in a few minutes.`;
      statusCode = 503;
    }

    await SystemLogger.logError({
      message: errorMessage,
      source: 'API /api/video/generate',
      path: '/api/video/generate',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}