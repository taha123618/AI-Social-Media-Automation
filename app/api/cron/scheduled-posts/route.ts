import { NextRequest, NextResponse } from 'next/server';
import { SchedulerService } from '@/features/scheduler/services/scheduler.service';
import prisma from '@/lib/prisma';

/**
 * POST /api/cron/scheduled-posts
 * 
 * Cron job endpoint for processing scheduled posts
 * Runs every minute to check for posts ready to be published
 * 
 * Security: Requires CRON_SECRET header in production
 * 
 * LOGIC:
 * 1. Checks if any scheduled posts exist in the POST table with scheduledFor <= now
 * 2. If no valid scheduled posts exist, skips execution
 * 3. When a post's scheduled time is updated, the cron automatically picks it up
 * 4. Only processes posts that are due based on the configured posting schedule
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if any scheduled posts exist in the POST table
    const scheduledCount = await prisma.post.count({
      where: {
        scheduledFor: {
          lte: new Date()
        }
      }
    });

    // If no scheduled posts exist, don't run the cron job
    if (scheduledCount === 0) {
      console.log('[Cron] No scheduled posts found in POST table, skipping execution');
      return NextResponse.json({ 
        message: 'No scheduled posts found', 
        processed: 0,
        executed: false,
        reason: 'no_scheduled_posts'
      });
    }

    console.log(`[Cron] Found ${scheduledCount} scheduled posts ready for processing`);

    // Process scheduled posts through the scheduler service
    const result = await SchedulerService.processScheduledPosts();

    return NextResponse.json({ 
      message: 'Cron job executed successfully',
      processed: scheduledCount,
      result,
      executed: true 
    });

  } catch (error: unknown) {
    console.error('[Cron] Error processing scheduled posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: errorMessage,
      executed: false 
    }, { status: 500 });
  }
}

// Allow GET for Vercel Cron compatibility
export const GET = POST;
