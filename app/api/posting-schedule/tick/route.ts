import { NextRequest, NextResponse } from 'next/server';
import { PostingScheduleService } from '@/features/scheduler/services/posting-schedule.service';

/**
 * POST /api/posting-schedule/tick
 *
 * Called every minute by an external cron (e.g. Vercel Cron, GitHub Actions, or a Node cron job).
 * Finds schedule slots that match the current UTC time and enqueues queued Posts.
 *
 * Secure this with a shared secret in production:
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await PostingScheduleService.processTick();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('[cron/tick]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Also allow GET so Vercel Cron configs work (they use GET)
export const GET = POST;
