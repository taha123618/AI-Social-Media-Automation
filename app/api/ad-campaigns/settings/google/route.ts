import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const Schema = z.object({
  developerToken: z.string().min(1),
  customerId: z.string().min(1),
});

/**
 * POST /api/ad-campaigns/settings/google
 *
 * Saves the Google Ads Developer Token (apiKey) and Customer ID (apiSecret)
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

    const { developerToken, customerId } = body.data;
    const cleanId = customerId.replace(/-/g, ''); // strip dashes

    await prisma.thirdPartyService.upsert({
      where: { businessId_platform: { businessId, platform: 'GOOGLE_BUSINESS' as any } },
      create: { businessId, platform: 'GOOGLE_BUSINESS' as any, apiKey: developerToken, apiSecret: cleanId, isActive: true },
      update: { apiKey: developerToken, apiSecret: cleanId, isActive: true },
    });

    // Also create/update the AdAccount record
    const existingAccount = await prisma.adAccount.findFirst({
      where: { businessId, platform: 'GOOGLE' as any, platformAccountId: cleanId },
    });
    if (existingAccount) {
      await prisma.adAccount.update({
        where: { id: existingAccount.id },
        data: { name: `Google Ads ${cleanId}`, lastSyncedAt: new Date() },
      });
    } else {
      await prisma.adAccount.create({
        data: {
          businessId, platform: 'GOOGLE', name: `Google Ads ${cleanId}`,
          platformAccountId: cleanId, status: 'ACTIVE', lastSyncedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/ad-campaigns/settings/google]', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

/**
 * GET /api/ad-campaigns/settings/google
 * Returns configuration status without exposing raw tokens.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const record = await prisma.thirdPartyService.findFirst({
      where: { businessId, platform: 'GOOGLE_BUSINESS' as any },
      select: { apiKey: true, apiSecret: true, isActive: true },
    });

    return NextResponse.json({
      customerId: record?.apiSecret ?? '',
      // Never return raw developer token — just a presence indicator
      developerTokenSet: !!(record?.apiKey),
      isConfigured: !!(record?.apiKey && record?.apiSecret),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
