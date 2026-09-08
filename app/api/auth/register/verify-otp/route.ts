import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { SystemLogger } from "@/features/system/services/logger.service";

const verifyOtpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  otp: z.string().length(6, "Verification code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { name, email, password, otp } = verifyOtpSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();
    const identifier = `register-otp:${normalizedEmail}`;

    // 1. Fetch verification record
    const verification = await prisma.verification.findFirst({
      where: {
        identifier,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      await SystemLogger.logAudit({
        action: "2FA_REGISTER_OTP_FAILED",
        resource: "auth",
        status: "FAILURE",
        ipAddress,
        userAgent,
        details: { email: normalizedEmail, reason: "No OTP record found" },
      });

      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // 2. Check Expiry
    if (new Date() > new Date(verification.expiresAt)) {
      await prisma.verification.deleteMany({ where: { identifier } });

      await SystemLogger.logAudit({
        action: "2FA_REGISTER_OTP_EXPIRED",
        resource: "auth",
        status: "FAILURE",
        ipAddress,
        userAgent,
        details: { email: normalizedEmail, expiredAt: verification.expiresAt },
      });

      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 3. Verify OTP Match
    if (verification.value !== otp.trim()) {
      await SystemLogger.logAudit({
        action: "2FA_REGISTER_OTP_MISMATCH",
        resource: "auth",
        status: "FAILURE",
        ipAddress,
        userAgent,
        details: { email: normalizedEmail, reason: "Incorrect OTP code provided" },
      });

      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 400 }
      );
    }

    // 4. Clean up the OTP verification record
    await prisma.verification.deleteMany({
      where: { identifier },
    });

    // 5. Check if user was somehow created in between
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists. Please log in." },
        { status: 409 }
      );
    }

    // 6. Create User with Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name,
        email: normalizedEmail,
        password,
      },
    });

    if (!signUpResult?.user) {
      return NextResponse.json(
        { error: "Registration failed during account initialization" },
        { status: 500 }
      );
    }

    // 7. Mark Email as Verified in User Table
    await prisma.user.update({
      where: { id: signUpResult.user.id },
      data: { emailVerified: true },
    });

    // 8. Log Success Audit
    await SystemLogger.logAudit({
      action: "2FA_REGISTER_OTP_VERIFIED",
      resource: "auth",
      status: "SUCCESS",
      userId: signUpResult.user.id,
      ipAddress,
      userAgent,
      details: { email: normalizedEmail, name },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Workspace activated.",
      user: {
        id: signUpResult.user.id,
        name: signUpResult.user.name,
        email: signUpResult.user.email,
        image: signUpResult.user.image,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/auth/register/verify-otp:", error);

    await SystemLogger.logError({
      message: error.message || "Failed to verify registration OTP",
      source: "app/api/auth/register/verify-otp/route.ts",
      path: "/api/auth/register/verify-otp",
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to verify code and register account" },
      { status: 500 }
    );
  }
}
