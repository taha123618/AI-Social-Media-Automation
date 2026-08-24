import { NextRequest, NextResponse } from 'next/server';
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

    // Test email configuration
    const testResetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=test-token-123`;

    await sendForgotPasswordEmail(email, testResetUrl, "Test User");

    return NextResponse.json(
      {
        success: true,
        message: 'Test email sent successfully',
        email: email,
        resetUrl: testResetUrl
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test email'
      },
      { status: 500 }
    );
  }
}
