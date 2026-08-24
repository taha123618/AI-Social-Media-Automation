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

    // Sign in with email and password
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!result.user) {
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

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        image: result.user.image,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);

    await SystemLogger.logError({
      message: error.message || "Login failed",
      source: "app/api/auth/login/route.ts",
      path: "/api/auth/login",
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
