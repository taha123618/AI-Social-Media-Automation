import { NextRequest, NextResponse } from 'next/server';
import { PostingScheduleService } from '@/features/scheduler/services/posting-schedule.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function getAuthorizedBusinessId(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const businessId = req.headers.get('x-business-id');
  if (!businessId) {
    throw new Error('Missing x-business-id header');
  }

  const membership = await prisma.businessMember.findFirst({
    where: { businessId, userId: session.user.id },
  });

  if (!membership) {
    throw new Error('Forbidden');
  }

  return businessId;
}

function handleAuthError(err: any) {
  if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (err.message === 'Missing x-business-id header') return NextResponse.json({ error: err.message }, { status: 400 });
  return null;
}

/** GET /api/posting-schedule — fetch the schedule for this business */
export async function GET(req: NextRequest) {
  try {
    const businessId = await getAuthorizedBusinessId(req);
    const schedule = await PostingScheduleService.getSchedule(businessId);
    return NextResponse.json(schedule);
  } catch (err: any) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/** POST /api/posting-schedule — add slot(s) */
// Body: { dayOfWeek: "MONDAY" | null (=all days), hour: 6, minute: 30 }
export async function POST(req: NextRequest) {
  try {
    const businessId = await getAuthorizedBusinessId(req);
    const body = await req.json();
    const { dayOfWeek, hour, minute } = body;

    if (hour === undefined || minute === undefined) {
      return NextResponse.json({ error: 'hour and minute are required' }, { status: 400 });
    }

    const created = await PostingScheduleService.addSlot(businessId, { dayOfWeek: dayOfWeek ?? null, hour, minute });

    await SystemLogger.logActivity({
      action: 'POSTING_SLOT_ADDED',
      entity: 'PostingSchedule',
      entityId: Array.isArray(created) ? created[0]?.id : (created as any)?.id,
      details: { businessId, dayOfWeek, hour, minute },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;

    await SystemLogger.logError({
      message: err.message,
      source: 'API /api/posting-schedule',
      path: '/api/posting-schedule',
      context: { method: 'POST' },
    });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/** DELETE /api/posting-schedule — remove all slots (clear) */
export async function DELETE(req: NextRequest) {
  try {
    const businessId = await getAuthorizedBusinessId(req);
    await PostingScheduleService.clearAll(businessId);

    await SystemLogger.logActivity({
      action: 'POSTING_SLOTS_CLEARED',
      entity: 'PostingSchedule',
      details: { businessId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;

    await SystemLogger.logError({
      message: err.message,
      source: 'API /api/posting-schedule',
      path: '/api/posting-schedule',
      context: { method: 'DELETE' },
    });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/** PATCH /api/posting-schedule — update timezone */
// Body: { timezone: "Asia/Karachi" }
export async function PATCH(req: NextRequest) {
  try {
    const businessId = await getAuthorizedBusinessId(req);
    const { timezone } = await req.json();
    if (!timezone) return NextResponse.json({ error: 'timezone required' }, { status: 400 });
    const updated = await PostingScheduleService.updateTimezone(businessId, timezone);

    await SystemLogger.logActivity({
      action: 'POSTING_TIMEZONE_UPDATED',
      entity: 'PostingSchedule',
      details: { businessId, timezone },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;

    await SystemLogger.logError({
      message: err.message,
      source: 'API /api/posting-schedule',
      path: '/api/posting-schedule',
      context: { method: 'PATCH' },
    });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
