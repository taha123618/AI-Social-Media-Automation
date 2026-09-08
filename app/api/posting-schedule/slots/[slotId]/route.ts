import { NextRequest, NextResponse } from 'next/server';
import { PostingScheduleService } from '@/features/scheduler/services/posting-schedule.service';
import type { DayOfWeek } from '@/features/scheduler/services/posting-schedule.service';
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

/** DELETE /api/posting-schedule/slots/[slotId] — remove a specific slot */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const businessId = await getAuthorizedBusinessId(req);
    const { slotId } = await params;
    await PostingScheduleService.removeSlot(slotId, businessId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    const businessId = await getAuthorizedBusinessId(req);
    const { dayOfWeek, enabled } = await req.json();
    if (!dayOfWeek || enabled === undefined) {
      return NextResponse.json({ error: 'dayOfWeek and enabled required' }, { status: 400 });
    }
    const result = await PostingScheduleService.toggleDay(businessId, dayOfWeek as DayOfWeek, enabled);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
