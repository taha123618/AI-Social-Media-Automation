import { NextRequest, NextResponse } from "next/server";
import { MaintenanceService } from "@/lib/maintenance";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await MaintenanceService.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("[Admin Maintenance API] GET failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Basic validation
    if (typeof body.isEnabled !== "boolean") {
      return NextResponse.json({ error: "isEnabled field must be a boolean" }, { status: 400 });
    }

    const clientIp = MaintenanceService.getClientIp(req.headers);
    const userAgent = req.headers.get("user-agent") || undefined;

    const updatedConfig = await MaintenanceService.updateConfig(
      {
        isEnabled: body.isEnabled,
        message: body.message || "We are currently undergoing scheduled maintenance. Please check back soon.",
        estimatedCompletion: body.estimatedCompletion || null,
        allowlistIps: Array.isArray(body.allowlistIps) ? body.allowlistIps : [],
        allowlistEmails: Array.isArray(body.allowlistEmails) ? body.allowlistEmails : [],
        apiBlocked: typeof body.apiBlocked === "boolean" ? body.apiBlocked : true,
      },
      session.email,
      session.id,
      clientIp,
      userAgent
    );

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("[Admin Maintenance API] POST failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
