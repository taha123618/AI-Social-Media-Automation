import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const UpdateSchema = z.object({
  headline: z.string().optional(),
  primaryText: z.string().optional(),
  description: z.string().optional(),
  cta: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  isWinner: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; adSetId: string; adId: string; variantId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });

    const { variantId, adId } = await params;

    const business = await prisma.business.findFirst({
      where: { id: businessId, members: { some: { userId: session.user.id } } },
      select: { id: true },
    });
    if (!business) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });

    const data: any = {};
    if (parsed.data.headline !== undefined) data.headline = parsed.data.headline;
    if (parsed.data.primaryText !== undefined) data.primaryText = parsed.data.primaryText;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.cta !== undefined) data.cta = parsed.data.cta;
    if (parsed.data.imageUrl !== undefined) data.imageUrl = parsed.data.imageUrl;
    if (parsed.data.isWinner !== undefined) {
      // Unset any existing winner for this ad, then set the new one
      await prisma.adVariant.updateMany({ where: { adId, isWinner: true }, data: { isWinner: false } });
      data.isWinner = true;
    }

    const updated = await prisma.adVariant.update({ where: { id: variantId }, data });
    return NextResponse.json({ success: true, variant: updated });
  } catch (error: any) {
    console.error('[PATCH /api/ad-campaigns/[id]/ad-sets/[adSetId]/ads/[adId]/variants/[variantId]]', error);
    return NextResponse.json({ success: false, error: 'Failed to update variant' }, { status: 500 });
  }
}
