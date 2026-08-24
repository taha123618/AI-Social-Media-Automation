import { NextRequest, NextResponse } from 'next/server';
import { PostingScheduleService } from '@/features/scheduler/services/posting-schedule.service';
import type { DayOfWeek } from '@/features/scheduler/services/posting-schedule.service';

function getBusinessId(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) throw new Error('Missing x-business-id header');
  return businessId;
}

/** PATCH /api/posting-schedule/slots/toggle — enable/disable all slots for a day */
export async function PATCH(req: NextRequest) {
  try {
    const businessId = getBusinessId(req);
    const { dayOfWeek, enabled } = await req.json();
    if (!dayOfWeek || enabled === undefined) {
      return NextResponse.json({ error: 'dayOfWeek and enabled required' }, { status: 400 });
    }
    const result = await PostingScheduleService.toggleDay(businessId, dayOfWeek as DayOfWeek, enabled);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
