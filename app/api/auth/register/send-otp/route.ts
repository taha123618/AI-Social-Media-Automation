import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { SecurityService } from "@/lib/security";
import { sendRegisterOtpEmail } from "@/lib/email-service";
import { SystemLogger } from "@/features/system/services/logger.service";

const sendOtpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { name, email, password } = sendOtpSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Validate password strength
    const passwordValidation = SecurityService.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message || "Password is too weak" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 3. Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry
    const identifier = `register-otp:${normalizedEmail}`;

    // 4. Upsert verification record
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

    // 5. Send OTP Email
    await sendRegisterOtpEmail(normalizedEmail, otp, name);

    // 6. Log Audit Trail
    await SystemLogger.logAudit({
      action: "2FA_REGISTER_OTP_SENT",
      resource: "auth",
      status: "SUCCESS",
      ipAddress,
      userAgent,
      details: { email: normalizedEmail, expiresAt: expiresAt.toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/register/send-otp:", error);

    await SystemLogger.logError({
      message: error.message || "Failed to send registration OTP",
      source: "app/api/auth/register/send-otp/route.ts",
      path: "/api/auth/register/send-otp",
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to send verification code" },
      { status: 500 }
    );
  }
}
