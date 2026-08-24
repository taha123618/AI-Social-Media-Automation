import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAutopilotPlan, createDraftsFromPlan } from '@/features/generation/services/autopilot-generator.service';
import { Platform as GeneratedPlatform } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';
import { SchedulerService } from '@/features/scheduler/services/scheduler.service';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { businessId, creatorId, days = 30, postsPerWeek, platforms, contentMix } = body;

    if (!businessId || !creatorId) {
      return NextResponse.json(
        { error: 'Business ID and Creator ID are required' },
        { status: 400 }
      );
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      );
    }

    console.log('Enqueuing autopilot generation:', { businessId, creatorId, days, platforms });

    // Add to background queue
    const job = await SchedulerService.queueAutopilotTask({
      businessId,
      creatorId,
      days,
      postsPerWeek,
      platforms: platforms as any,
      contentMix
    });

    await SystemLogger.logActivity({
      action: 'AUTOPILOT_GENERATION_QUEUED',
      entity: 'AutopilotPlan',
      userId: creatorId,
      details: {
        businessId,
        jobId: job.id,
        days,
        platforms
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Autopilot generation started in the background',
      jobId: job.id,
      description: `We are generating your ${days}-day content plan for ${platforms.join(', ')}. Your drafts will appear in the content library shortly.`
    }, { status: 202 });

  } catch (error) {
    console.error('Autopilot generation failed:', error);
    await SystemLogger.logError({
      message: error instanceof Error ? error.message : 'Autopilot generation failed',
      source: 'API /api/autopilot/generate',
      path: '/api/autopilot/generate',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to generate autopilot plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/autopilot/status - Check if autopilot is active
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Count scheduled posts for next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const scheduledCount = await prisma.contentDraft.count({
      where: {
        businessId,
        scheduledFor: {
          gte: new Date(),
          lte: thirtyDaysFromNow
        },
        status: 'GENERATED'
      }
    });

    const hasActiveAutopilot = scheduledCount > 10; // Threshold for "active"

    return NextResponse.json({
      success: true,
      data: {
        hasActiveAutopilot,
        scheduledPostsCount: scheduledCount,
        daysCovered: Math.min(scheduledCount, 30)
      }
    });
  } catch (error) {
    console.error('Autopilot status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check autopilot status' },
      { status: 500 }
    );
  }
}
