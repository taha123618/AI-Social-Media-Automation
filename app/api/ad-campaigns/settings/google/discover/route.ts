import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdAccountService from '@/features/ad-campaigns/services/ad-account.service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const credential = await prisma.platformCredential.findFirst({
      where: { businessId, platform: 'GOOGLE' as any },
      orderBy: { createdAt: 'desc' },
    });

    if (!credential?.accessToken) {
      return NextResponse.json({ error: 'No Google credentials found' }, { status: 400 });
    }

    const third = await prisma.thirdPartyService.findFirst({ where: { businessId, platform: 'GOOGLE_BUSINESS' as any } });
    const developerToken = third?.apiKey ?? process.env.GOOGLE_DEVELOPER_TOKEN;
    if (!developerToken) return NextResponse.json({ error: 'Developer token not configured' }, { status: 400 });

    const accessToken = credential.accessToken;

    const url = 'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const json = await res.json();
    if (!json.resourceNames) return NextResponse.json({ error: 'No customers returned', details: json }, { status: 500 });

    const created: any[] = [];
    for (const r of json.resourceNames) {
      const parts = r.split('/');
      const customerId = parts[1];

      // Fetch detailed info for each customer
      let name = `Google Ads ${customerId}`;
      let currency: string | undefined;
      let timezone: string | undefined;

      try {
        const detailRes = await fetch(`https://googleads.googleapis.com/v14/customers/${customerId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'developer-token': developerToken,
          },
        });
        const detailJson = await detailRes.json();
        if (detailJson.descriptiveName) name = detailJson.descriptiveName;
        if (detailJson.currencyCode) currency = detailJson.currencyCode;
        if (detailJson.timeZone) timezone = detailJson.timeZone;
      } catch {
        // Non-fatal — use defaults
      }

      const existing = await prisma.adAccount.findFirst({ where: { businessId, platform: 'GOOGLE' as any, platformAccountId: customerId } });
      if (existing) {
        await prisma.adAccount.update({
          where: { id: existing.id },
          data: { name, status: 'ACTIVE', currency, timezone, lastSyncedAt: new Date() },
        });
        created.push({ ...existing, updated: true });
      } else {
        const c = await prisma.adAccount.create({
          data: {
            businessId,
            platform: 'GOOGLE',
            name,
            platformAccountId: customerId,
            status: 'ACTIVE',
            currency,
            timezone,
            lastSyncedAt: new Date(),
          },
        });
        created.push({ ...c, created: true });
      }
    }

    return NextResponse.json({ success: true, accounts: created });
  } catch (err: any) {
    console.error('[Google Discover]', err);
    return NextResponse.json({ error: err.message || 'Discovery failed' }, { status: 500 });
  }
}
