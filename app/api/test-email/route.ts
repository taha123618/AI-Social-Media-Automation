import { NextRequest, NextResponse } from 'next/server';
import { sendForgotPasswordEmail } from '@/lib/email-service';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  // 1. Definitively disable open email test endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Forbidden: Diagnostic test endpoints are strictly disabled in production.' },
      { status: 403 }
    );
  }

  // 2. In non-production environments, require an active admin session
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required to trigger test emails.' },
      { status: 401 }
    );
  }

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
