import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SystemLogger } from "@/features/system/services/logger.service";

export async function POST(request: NextRequest) {
  try {
    // Get the session to know which user is logging out
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    await auth.api.signOut({
      headers: request.headers,
    });

    if (session?.user) {
      await SystemLogger.logAudit({
        action: "LOGOUT",
        resource: "auth",
        status: "SUCCESS",
        userId: session.user.id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);

    await SystemLogger.logError({
      message: error.message || "Logout failed",
      source: "app/api/auth/logout/route.ts",
      path: "/api/auth/logout",
      stack: error.stack,
    });

    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
