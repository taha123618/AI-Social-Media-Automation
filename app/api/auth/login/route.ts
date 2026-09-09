import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { SystemLogger } from "@/features/system/services/logger.service";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Forward the incoming request headers so Better Auth can validate
    // the request origin, host, and content-type properly.
    // Without this, auth.api.signInEmail() can throw "User not found"
    // even when credentials are correct (mobile clients, cross-origin calls).
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: request.headers,
    });

    if (!result?.user) {
      await SystemLogger.logAudit({
        action: "LOGIN",
        resource: "auth",
        status: "FAILURE",
        details: { email, reason: "Invalid credentials" },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await SystemLogger.logAudit({
      action: "LOGIN",
      resource: "auth",
      status: "SUCCESS",
      userId: result.user.id,
      ipAddress,
      userAgent,
    });

    // Better Auth returns token on the result object for API (non-browser) clients
    const token =
      (result as any).token ??
      (result as any).session?.token ??
      null;

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        image: result.user.image ?? null,
      },
    });
  } catch (error: any) {
    // Surface the actual Better Auth error message to aid debugging
    const betterAuthMsg: string =
      error?.body?.message ||
      error?.message ||
      "Login failed";

    console.error("Login error:", betterAuthMsg, error);

    await SystemLogger.logError({
      message: betterAuthMsg,
      source: "app/api/auth/login/route.ts",
      path: "/api/auth/login",
      stack: error?.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    // Map Better Auth UNAUTHORIZED → 401, everything else → 500
    const statusCode =
      error?.statusCode === 401 || error?.status === "UNAUTHORIZED"
        ? 401
        : 500;

    return NextResponse.json(
      { error: betterAuthMsg },
      { status: statusCode }
    );
  }
}

