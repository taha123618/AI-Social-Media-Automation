import { NextResponse } from 'next/server';
import { getEmailQueueStatus } from '@/lib/emailQueue';

export async function GET() {
  try {
    const status = await getEmailQueueStatus();

    return NextResponse.json({
      success: true,
      queue: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get queue status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get queue status'
      },
      { status: 500 }
    );
  }
}
