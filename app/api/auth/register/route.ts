import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { SystemLogger } from "@/features/system/services/logger.service";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Create user with email and password
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!result.user) {
      await SystemLogger.logAudit({
        action: "REGISTER",
        resource: "auth",
        status: "FAILURE",
        details: { email, reason: "Prisma or Auth failure" },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: "Registration failed" },
        { status: 400 }
      );
    }

    await SystemLogger.logAudit({
      action: "REGISTER",
      resource: "auth",
      status: "SUCCESS",
      userId: result.user.id,
      ipAddress,
      userAgent,
      details: { email, name },
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
    console.error("Registration error:", error);

    await SystemLogger.logError({
      message: error.message || "Registration failed",
      source: "app/api/auth/register/route.ts",
      path: "/api/auth/register",
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
