import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const Schema = z.object({
  adAccountId: z.string().min(1),
  pageId: z.string().min(1),
});

/**
 * POST /api/ad-campaigns/settings/meta
 *
 * Saves the Meta Ad Account ID (apiKey) and Facebook Page ID (apiSecret)
 * into ThirdPartyService for the active business.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Verify membership
    const isMember = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id },
    });
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = Schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid data', details: body.error.format() }, { status: 400 });
    }

    const { adAccountId, pageId } = body.data;
    const normalised = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

    await prisma.thirdPartyService.upsert({
      where: { businessId_platform: { businessId, platform: 'FACEBOOK' as any } },
      create: { businessId, platform: 'FACEBOOK' as any, apiKey: normalised, apiSecret: pageId, isActive: true },
      update: { apiKey: normalised, apiSecret: pageId, isActive: true },
    });

    // Also create/update the AdAccount record so discovery shows it
    const existingAccount = await prisma.adAccount.findFirst({
      where: { businessId, platform: 'META' as any, platformAccountId: normalised },
    });
    if (existingAccount) {
      await prisma.adAccount.update({
        where: { id: existingAccount.id },
        data: { name: `Meta ${normalised}`, pageId, lastSyncedAt: new Date() },
      });
    } else {
      await prisma.adAccount.create({
        data: {
          businessId, platform: 'META', name: `Meta ${normalised}`,
          platformAccountId: normalised, pageId, status: 'ACTIVE', lastSyncedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/ad-campaigns/settings/meta]', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

/**
 * GET /api/ad-campaigns/settings/meta
 * Returns current Meta settings (non-sensitive).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const record = await prisma.thirdPartyService.findFirst({
      where: { businessId, platform: 'FACEBOOK' as any },
      select: { apiKey: true, apiSecret: true, isActive: true },
    });

    // Fallback to AdAccount if ThirdPartyService not set
    const adAccount = !record?.apiKey
      ? await prisma.adAccount.findFirst({ where: { businessId, platform: 'META' as any, isPrimary: true } })
      : null;

    return NextResponse.json({
      adAccountId: record?.apiKey ?? adAccount?.platformAccountId ?? '',
      pageId: record?.apiSecret ?? adAccount?.pageId ?? '',
      isConfigured: !!(record?.apiKey && record?.apiSecret) || !!adAccount,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
