import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/features/video_generation/services/video.service";
import { auth } from "@/lib/auth";

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

    const { id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    // Get business ID from header
    const businessId = request.headers.get('x-business-id');
    console.log('Refresh API - Business ID from header:', businessId);
    console.log('Refresh API - Job ID:', jobId);

    if (!businessId) {
      console.log('Refresh API - Business ID missing');
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // Refresh the video URL
    const freshUrl = await VideoService.refreshVideoUrl(jobId);

    if (!freshUrl) {
      return NextResponse.json({ error: "Failed to refresh video URL" }, { status: 500 });
    }

    return NextResponse.json({ videoUrl: freshUrl });
  } catch (error) {
    console.error("Video URL refresh error:", error);

    return NextResponse.json(
      { error: "Failed to refresh video URL" },
      { status: 500 }
    );
  }
}
