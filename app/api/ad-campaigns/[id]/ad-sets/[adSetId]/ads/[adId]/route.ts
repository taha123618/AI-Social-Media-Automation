import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.string().optional(),
  creative: z.any().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; adSetId: string; adId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });

    const { adId } = await params;

    const business = await prisma.business.findFirst({
      where: { id: businessId, members: { some: { userId: session.user.id } } },
      select: { id: true },
    });
    if (!business) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });

    const data: any = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.creative !== undefined) data.creative = parsed.data.creative;

    const updated = await prisma.ad.update({ where: { id: adId }, data });
    return NextResponse.json({ success: true, ad: updated });
  } catch (error: any) {
    console.error('[PATCH /api/ad-campaigns/[id]/ad-sets/[adSetId]/ads/[adId]]', error);
    return NextResponse.json({ success: false, error: 'Failed to update ad' }, { status: 500 });
  }
}
