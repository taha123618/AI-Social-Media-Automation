import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");
    const events = await prisma.jobLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      events.map(log => ({
        id: log.id,
        user: log.queueName === "email" ? "Email Service" : "System Worker",
        action: `${log.status.toUpperCase()}: ${log.queueName} job processed`,
        time: log.createdAt.toISOString(),
        type: (log.status === "failed" ? "warning" : log.status === "completed" ? "success" : "info") as "warning" | "success" | "info",
      }))
    );
  } catch (error) {
    console.error("Error fetching security events:", error);
    return NextResponse.json({ error: "Failed to fetch security events" }, { status: 500 });
  }
}
