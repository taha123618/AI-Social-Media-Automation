import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/features/video_generation/services/video.service";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Check status
    const status = await VideoService.checkStatus(jobId);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Video status check error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to check video status" },
      { status: 500 }
    );
  }
}