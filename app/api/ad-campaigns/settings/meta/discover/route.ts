import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdAccountService from '@/features/ad-campaigns/services/ad-account.service';
import { MetaAccountParser } from '@/features/ad-campaigns/services/providers/meta-account-parser';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const credential = await prisma.platformCredential.findFirst({
      where: { businessId, platform: 'META' as any },
      orderBy: { createdAt: 'desc' },
    });

    if (!credential?.accessToken) {
      return NextResponse.json({ error: 'No Meta credentials found' }, { status: 400 });
    }

    const token = credential.accessToken;
    const res = await fetch(`https://graph.facebook.com/v17.0/me/adaccounts?fields=id,account_id,name,account_status,account_currency,currency,balance,timezone_name,min_daily_budget,lifetime_spend&access_token=${encodeURIComponent(token)}`);
    const json = await res.json();

    if (!json.data) return NextResponse.json({ error: 'No ad accounts returned', details: json }, { status: 500 });

    const created: any[] = [];
    for (const acc of json.data) {
      const parsed = MetaAccountParser.parse(acc);
      const fields = MetaAccountParser.extractFields(parsed);
      const platformAccountId = fields.platformAccountId ?? acc.id;
      const name = fields.name ?? platformAccountId;

      const existing = await prisma.adAccount.findFirst({ where: { businessId, platform: 'META' as any, platformAccountId } });
      if (existing) {
        await prisma.adAccount.update({
          where: { id: existing.id },
          data: {
            name,
            status: fields.status ?? 'ACTIVE',
            balance: fields.balance,
            currency: fields.currency,
            timezone: fields.timezone,
            details: acc,
            lastSyncedAt: new Date(),
          },
        });
        created.push({ ...existing, updated: true });
      } else {
        const c = await prisma.adAccount.create({
          data: {
            businessId,
            platform: 'META',
            name,
            platformAccountId,
            status: fields.status ?? 'ACTIVE',
            balance: fields.balance,
            currency: fields.currency,
            timezone: fields.timezone,
            details: acc,
            lastSyncedAt: new Date(),
          },
        });
        created.push({ ...c, created: true });
      }
    }

    return NextResponse.json({ success: true, accounts: created });
  } catch (err: any) {
    console.error('[Meta Discover]', err);
    return NextResponse.json({ error: err.message || 'Discovery failed' }, { status: 500 });
  }
}
