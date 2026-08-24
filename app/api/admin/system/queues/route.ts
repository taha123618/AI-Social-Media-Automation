import { NextRequest, NextResponse } from "next/server";
import { QueueManager } from "@/features/scheduler/config/queue.config";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await QueueManager.getAllQueueStats();

    return NextResponse.json({ 
      success: true,
      queues: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error fetching queue stats:", error);
    return NextResponse.json({ 
      error: "Failed to fetch queue stats",
      message: error.message 
    }, { status: 500 });
  }
}
