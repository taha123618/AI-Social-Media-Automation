import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const accounts = await prisma.adAccount.findMany({ where: { businessId } });
    const creds = await prisma.platformCredential.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({ accounts, credentials: creds });
  } catch (err: any) {
    console.error('[GET /api/ad-campaigns/accounts]', err);
    return NextResponse.json({ error: 'Failed to fetch ad accounts' }, { status: 500 });
  }
}
