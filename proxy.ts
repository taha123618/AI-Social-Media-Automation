import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAdminToken } from "@/lib/admin-auth";

// No in-memory cache — always resolve from Redis/DB via the status API so that
// toggling maintenance mode takes effect on the very next request.
async function getMaintenanceStatus(origin: string, cookieHeader: string, ipHeader: string) {
  try {
    const statusRes = await fetch(`${origin}/api/maintenance/status`, {
      headers: {
        cookie: cookieHeader,
        "x-forwarded-for": ipHeader,
      },
      cache: "no-store",
    });

    if (statusRes.ok) {
      return await statusRes.json();
    }
  } catch (err) {
    console.error("[Maintenance Middleware] Check failed, bypassing:", err);
  }
  return { isEnabled: false, message: "", estimatedCompletion: null, apiBlocked: false, bypassed: true };
}

/** Attach no-store headers to a response so browsers never cache page content. */
function withNoCacheHeaders(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Surrogate-Control", "no-store");
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;

  // 1. Maintenance Mode Check
  const isBypassedPrefix = [
    "/admin",
    "/api/admin",
    "/api/auth",
    "/api/maintenance",
    "/maintenance",
    "/_next",
    "/favicon.ico",
  ].some((prefix) => pathname.startsWith(prefix));

  if (!isBypassedPrefix) {
    const cookieHeader = request.headers.get("cookie") || "";
    const ipHeader =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const status = await getMaintenanceStatus(origin, cookieHeader, ipHeader);

    if (status.isEnabled && !status.bypassed) {
      const isApiRoute = pathname.startsWith("/api/");
      const isAction = request.headers.has("next-action");

      if (isApiRoute || isAction) {
        if (status.apiBlocked) {
          return new NextResponse(
            JSON.stringify({
              error: "Service Unavailable",
              message: status.message || "The site is currently undergoing scheduled maintenance.",
              estimatedCompletion: status.estimatedCompletion,
            }),
            {
              status: 503,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": "300",
                "Cache-Control": "no-store, no-cache, must-revalidate",
              },
            }
          );
        }
      } else {
        const redirectUrl = new URL("/maintenance", request.url);
        const response = NextResponse.redirect(redirectUrl);
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.headers.set("Pragma", "no-cache");
        return response;
      }
    }
  }

  // Handle /maintenance page logic separately if it's hit directly
  if (pathname === "/maintenance") {
    const cookieHeader = request.headers.get("cookie") || "";
    const ipHeader =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const status = await getMaintenanceStatus(origin, cookieHeader, ipHeader);

    if (!status.isEnabled || status.bypassed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return withNoCacheHeaders(NextResponse.next());
  }

  // 2. Admin Route Protection (Web & API)
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAdminLogin = pathname === "/admin/login" || pathname === "/api/admin/login";

  if (isAdminRoute && !isAdminLogin) {
    const adminToken = request.cookies.get("admin_token")?.value;
    const adminSession = adminToken ? await verifyAdminToken(adminToken) : null;

    if (!adminSession) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin/admins") && adminSession.role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden: Super admin privilege required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return withNoCacheHeaders(NextResponse.next());
  }

  // 3. Exempt Public Routes, Webhooks & Health Probes
  const PUBLIC_PREFIXES = [
    "/api/auth",
    "/api/admin/login",
    "/api/billing/webhooks",
    "/api/system/alerts",
    "/api/maintenance/status",
    "/api/cron",
    "/api/health",
    "/api/metrics",
    "/api/reviews/submit",
    "/api/talk-to-sales/leads",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/terms",
    "/privacy",
    "/review",
  ];

  const isPublic =
    pathname === "/" ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isPublic) {
    return withNoCacheHeaders(NextResponse.next());
  }

  // 4. API Routes Security — Deny by Default
  // Any API route not explicitly declared public in PUBLIC_PREFIXES MUST require an authenticated session
  if (pathname.startsWith("/api/")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Forward authenticated user identity to downstream route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email);

    const protectedRes = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return withNoCacheHeaders(protectedRes);
  }

  // 5. Protected User Web Pages
  const PROTECTED_PAGE_PREFIXES = [
    "/dashboard",
    "/contents",
    "/schedule",
    "/settings",
    "/team",
    "/workflow",
    "/workflows",
    "/videos",
    "/image",
    "/gallery",
    "/reviews",
    "/analytics",
    "/knowledge",
    "/posts",
    "/post-schedule",
    "/social",
    "/blog",
    "/ad-campaigns",
    "/competitors",
    "/trends",
    "/activity",
  ];

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedPage) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      const safeRedirect =
        pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/dashboard";
      loginUrl.searchParams.set("redirect", safeRedirect);
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email);

    const protectedRes = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return withNoCacheHeaders(protectedRes);
  }

  // Default pass-through for unlisted static/marketing pages — no-store cache control
  return withNoCacheHeaders(NextResponse.next());
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
