import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendRegisterOtpEmail } from "@/lib/email-service";
import { SystemLogger } from "@/features/system/services/logger.service";

const resendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { email, name } = resendOtpSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user is already registered
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const identifier = `register-otp:${normalizedEmail}`;

    // 2. Rate limit cooldown (60 seconds)
    const existingOtp = await prisma.verification.findFirst({
      where: { identifier },
      orderBy: { createdAt: "desc" },
    });

    if (existingOtp) {
      const secondsSinceLastOtp = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (secondsSinceLastOtp < 60) {
        const waitTime = Math.ceil(60 - secondsSinceLastOtp);
        return NextResponse.json(
          { error: `Please wait ${waitTime} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // 3. Generate new 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    await prisma.verification.deleteMany({
      where: { identifier },
    });

    await prisma.verification.create({
      data: {
        identifier,
        value: otp,
        expiresAt,
      },
    });

    // 4. Send email
    await sendRegisterOtpEmail(normalizedEmail, otp, name);

    // 5. Log audit
    await SystemLogger.logAudit({
      action: "2FA_REGISTER_OTP_RESENT",
      resource: "auth",
      status: "SUCCESS",
      ipAddress,
      userAgent,
      details: { email: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${normalizedEmail}`,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/register/resend-otp:", error);

    await SystemLogger.logError({
      message: error.message || "Failed to resend registration OTP",
      source: "app/api/auth/register/resend-otp/route.ts",
      path: "/api/auth/register/resend-otp",
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
