import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/features/video_generation/services/video.service";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get business ID from header
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // Get total count for pagination
    const totalCount = await VideoService.getBusinessJobsCount(businessId);

    // Get jobs for the business with pagination
    const jobs = await VideoService.getBusinessJobs(businessId, limit, offset);

    // Format response
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      businessId: job.businessId,
      provider: job.provider,
      prompt: job.prompt,
      status: job.status,
      videoUrl: job.videoUrl,
      thumbnailUrl: job.thumbnailUrl,
      duration: job.duration,
      aspectRatio: job.aspectRatio,
      quality: job.quality,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString()
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      totalCount,
      offset,
      limit
    });
  } catch (error) {
    console.error("Video jobs fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch video jobs" },
      { status: 500 }
    );
  }
}