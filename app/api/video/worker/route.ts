import { NextRequest, NextResponse } from "next/server";
import { VideoStatusWorker } from "@/features/video_generation/workers/video-status.worker";
import { auth } from "@/lib/auth";

// Global worker instance
let videoWorker: VideoStatusWorker | null = null;

function getWorkerInstance(): VideoStatusWorker {
  if (!videoWorker) {
    videoWorker = new VideoStatusWorker();
  }
  return videoWorker;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worker = getWorkerInstance();
    const stats = await worker.getQueueStats();

    return NextResponse.json({
      success: true,
      stats,
      message: "🚀 New API Methods Available:\n" +
        "// Add individual job to queue\n" +
        "await videoWorker.addStatusCheckJob({ jobId: 'job-id', businessId: 'business-id' });\n\n" +
        "// Add all pending jobs to queue\n" +
        "await videoWorker.addPendingJobsToQueue();\n\n" +
        "// Get queue statistics\n" +
        "const stats = await videoWorker.getQueueStats();"
    });
  } catch (error) {
    console.error("Video worker API error:", error);
    return NextResponse.json(
      { error: "Failed to get video worker status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const worker = getWorkerInstance();

    switch (body.action) {
      case 'addJob':
        const { jobId, businessId, options } = body;
        if (!jobId) {
          return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
        }

        await worker.addStatusCheckJob({ jobId, businessId }, options);

        return NextResponse.json({
          success: true,
          message: `✅ Added job ${jobId} to video status check queue`
        });

      case 'addPendingJobs':
        await worker.addPendingJobsToQueue();

        return NextResponse.json({
          success: true,
          message: "✅ Added all pending jobs to video status check queue"
        });

      case 'getStats':
        const stats = await worker.getQueueStats();

        return NextResponse.json({
          success: true,
          stats,
          message: "📊 Video worker queue statistics retrieved"
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Video worker API error:", error);
    return NextResponse.json(
      { error: "Failed to process video worker action" },
      { status: 500 }
    );
  }
}
