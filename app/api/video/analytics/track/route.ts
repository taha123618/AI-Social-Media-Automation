import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";
import prisma from "@/lib/prisma";

interface AnalyticsEvent {
  action: string;
  entityId?: string;
  details?: Record<string, any>;
}

export async function POST(
  request: NextRequest
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event: AnalyticsEvent = await request.json();

    // Validate event data
    if (!event.action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // Get user's businesses
    const userBusinesses = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      select: { businessId: true }
    });

    if (userBusinesses.length === 0) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    // Log the analytics event
    await SystemLogger.logActivity({
      action: `VIDEO_ANALYTICS_${event.action}`,
      entity: "VideoGenerationJob",
      entityId: event.entityId,
      userId: session.user.id,
      businessId: userBusinesses[0].businessId,
      details: event.details || {}
    });

    // Optionally store in a dedicated analytics table (if you have one)
    // For now, we'll just log it to the system logger

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
