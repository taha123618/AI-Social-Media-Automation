import { NextResponse } from 'next/server';

/**
 * GET /api/reviews/health
 * Simple health check to verify API is working
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Review API is running',
    timestamp: new Date().toISOString()
  });
}
