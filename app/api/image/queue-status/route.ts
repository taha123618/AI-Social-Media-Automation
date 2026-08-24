import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get queue statistics
    const queueStats = {
      imageGeneration: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        lastProcessed: null
      },
      brandGeneration: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        lastProcessed: null
      }
    };

    // In a real implementation, you would query Redis/BullMQ for actual stats
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: {
        stats: queueStats,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('[API] Queue status error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
