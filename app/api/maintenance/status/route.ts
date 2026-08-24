import { NextRequest, NextResponse } from "next/server";
import { MaintenanceService } from "@/lib/maintenance";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const config = await MaintenanceService.getConfig();

    const noCacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Surrogate-Control": "no-store",
    };

    if (!config.isEnabled) {
      return NextResponse.json(
        { isEnabled: false, message: "", estimatedCompletion: null, apiBlocked: false, bypassed: true },
        { headers: noCacheHeaders }
      );
    }

    // ─── Auto-expiry ────────────────────────────────────────────────────────────
    // If the admin set a completion time and it has already passed, treat
    // maintenance as disabled and asynchronously persist the change to DB+Redis.
    if (config.estimatedCompletion) {
      const completionTime = new Date(config.estimatedCompletion).getTime();
      if (Date.now() >= completionTime) {
        // Fire-and-forget so the API response is not delayed
        MaintenanceService.autoDisable().catch((err) =>
          console.error("[Maintenance API] Auto-disable failed:", err)
        );

        return NextResponse.json(
          { isEnabled: false, message: "", estimatedCompletion: null, apiBlocked: false, bypassed: true },
          { headers: noCacheHeaders }
        );
      }
    }
    // ────────────────────────────────────────────────────────────────────────────

    // Check bypass criteria
    const adminToken = req.cookies.get("admin_token")?.value;
    const clientIp = MaintenanceService.getClientIp(req.headers);

    // Retrieve user session via Better Auth to check allowed email bypass
    // Falls back gracefully if session is unavailable (unauthenticated requests, expired tokens, etc.)
    let userEmail: string | undefined = undefined;
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      if (session?.user?.email) {
        userEmail = session.user.email;
      }
    } catch (sessionError) {
      // Better Auth session retrieval failed (e.g., no cookies, session expired, invalid token).
      // This is expected for unauthenticated requests. User will still be checked against IP allowlist and admin token.
      console.debug(
        "[Maintenance API] Session retrieval skipped:",
        sessionError instanceof Error ? sessionError.message : String(sessionError)
      );
    }

    const bypassed = await MaintenanceService.checkBypass({
      adminToken,
      clientIp,
      userEmail,
      config,
    });

    return NextResponse.json(
      {
        isEnabled: config.isEnabled,
        message: config.message,
        estimatedCompletion: config.estimatedCompletion,
        apiBlocked: config.apiBlocked,
        bypassed,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[Maintenance API] Status check failed:", error);
    return NextResponse.json(
      {
        isEnabled: false,
        message: "Failed to resolve maintenance status",
        estimatedCompletion: null,
        apiBlocked: false,
        bypassed: true,
      },
      { status: 500 }
    );
  }
}
