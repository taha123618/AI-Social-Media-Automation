import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
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
      // Explicitly opt-out of the fetch cache so Next.js never serves a stale response
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
    const ipHeader = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1";
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
    const ipHeader = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1";
    const status = await getMaintenanceStatus(origin, cookieHeader, ipHeader);

    if (!status.isEnabled || status.bypassed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Maintenance page itself must not be cached
    return withNoCacheHeaders(NextResponse.next());
  }

  // 2. Authentication & Route Protection Checks
  // Admin route protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("admin_token")?.value;
    const adminSession = adminToken ? await verifyAdminToken(adminToken) : null;

    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin/admins") && adminSession.role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Admin routes must also never be cached so they always reflect live data
    return withNoCacheHeaders(NextResponse.next());
  }

  // Protected User Routes check
  const PROTECTED_PREFIXES = [
    "/dashboard/:path*",
    "/contents/:path*",
    "/schedule/:path*",
    "/settings/:path*",
    "/team/:path*",
    "/workflow/:path*",
    "/videos/:path*",
    "/image/:path*",
    "/gallery/:path*",
    "/reviews/:path*",
    "/analytics/:path*",
    "/knowledge/:path*",
    "/posts/:path*",
    "/post-schedule/:path*",
    "/social/:path*",
    "/api/dashboard/:path*",
    "/api/user/:path*",
    "/api/contents/:path*",
    "/api/schedule/:path*",
    "/api/settings/:path*",
    "/api/team/:path*",
    "/api/workflow/:path*",
    "/api/videos/:path*",
    "/api/image/:path*",
    "/api/gallery/:path*",
  ];

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (isProtected) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/login", request.url);
      // Prevent open-redirect vulnerabilities by validating the redirect path
      const safeRedirect = pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/dashboard";
      loginUrl.searchParams.set("redirect", safeRedirect);
      return NextResponse.redirect(loginUrl);
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email);

    const protectedRes = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return withNoCacheHeaders(protectedRes);
  }

  // Default pass-through — still prevent browser caching for all HTML pages
  return withNoCacheHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
