import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PostingScheduleService } from '@/features/scheduler/services/posting-schedule.service';
import { SystemLogger } from '@/features/system/services/logger.service';

function getBusinessId(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) throw new Error('Missing x-business-id header');
  return businessId;
}

/** GET /api/posting-schedule — fetch the schedule for this business */
export async function GET(req: NextRequest) {
  try {
    const businessId = getBusinessId(req);
    const schedule = await PostingScheduleService.getSchedule(businessId);
    return NextResponse.json(schedule);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/** POST /api/posting-schedule — add slot(s) */
// Body: { dayOfWeek: "MONDAY" | null (=all days), hour: 6, minute: 30 }
export async function POST(req: NextRequest) {
  try {
    const businessId = getBusinessId(req);
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
    const businessId = getBusinessId(req);
    await PostingScheduleService.clearAll(businessId);

    await SystemLogger.logActivity({
      action: 'POSTING_SLOTS_CLEARED',
      entity: 'PostingSchedule',
      details: { businessId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
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
    const businessId = getBusinessId(req);
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
    await SystemLogger.logError({
      message: err.message,
      source: 'API /api/posting-schedule',
      path: '/api/posting-schedule',
      context: { method: 'PATCH' },
    });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
