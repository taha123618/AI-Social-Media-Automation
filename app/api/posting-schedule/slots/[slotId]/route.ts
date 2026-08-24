import { NextRequest, NextResponse } from 'next/server';
import { PostingScheduleService } from '@/features/scheduler/services/posting-schedule.service';
import type { DayOfWeek } from '@/features/scheduler/services/posting-schedule.service';

function getBusinessId(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) throw new Error('Missing x-business-id header');
  return businessId;
}

/** DELETE /api/posting-schedule/slots/[slotId] — remove a specific slot */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const businessId = getBusinessId(req);
    const { slotId } = await params;
    await PostingScheduleService.removeSlot(slotId, businessId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/** PATCH /api/posting-schedule/slots/[slotId] — toggle a day on/off */
// Body: { dayOfWeek: "MONDAY", enabled: true }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
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
