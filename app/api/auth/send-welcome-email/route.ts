import { NextRequest, NextResponse } from 'next/server';
import { sendRegistrationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send welcome email
    await sendRegistrationEmail(email, name);

    console.log(`Welcome email sent to: ${email}`);

    return NextResponse.json(
      { message: 'Welcome email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
