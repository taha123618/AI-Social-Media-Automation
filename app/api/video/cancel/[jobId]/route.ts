import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/features/video_generation/services/video.service";
import { auth } from "@/lib/auth";

export async function POST(
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

    // Cancel job
    const success = await VideoService.cancelJob(jobId);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Video cancellation error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to cancel video job" },
      { status: 500 }
    );
  }
}