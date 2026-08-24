import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendForgotPasswordEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email with reset link
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    try {
      // Send email using simple email service
      await sendForgotPasswordEmail(email, resetUrl, user.name);

      console.log(`Password reset email sent to: ${email}`);
      console.log(`Reset token: ${resetToken}`);
      console.log(`Reset URL: ${resetUrl}`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Continue with the process even if email fails
      // In production, you might want to handle this differently
    }

    // For development, include the reset URL in the response
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          message: 'Password reset email sent',
          demoToken: resetToken,
          demoUrl: resetUrl
        },
        { status: 200 }
      );
    }

    // In production, just return success message
    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
