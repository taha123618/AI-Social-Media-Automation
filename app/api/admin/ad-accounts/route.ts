import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platformFilter = searchParams.get('platform');
    const businessIdFilter = searchParams.get('businessId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200);

    const accounts = await prisma.adAccount.findMany({
      where: {
        ...(platformFilter ? { platform: platformFilter as any } : {}),
        ...(businessIdFilter ? { businessId: businessIdFilter } : {}),
      },
      orderBy: [{ platform: 'asc' }, { isPrimary: 'desc' }, { name: 'asc' }],
      take: limit,
      include: {
        business: { select: { id: true, name: true, slug: true } },
        credentials: { select: { id: true, platform: true, expiresAt: true, createdAt: true } },
      },
    });

    const stats = {
      total: await prisma.adAccount.count(),
      byPlatform: {
        META: await prisma.adAccount.count({ where: { platform: 'META' as any } }),
        GOOGLE: await prisma.adAccount.count({ where: { platform: 'GOOGLE' as any } }),
      },
      withExpiringCreds: await prisma.platformCredential.count({
        where: { expiresAt: { not: null, lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      }),
      expiredCreds: await prisma.platformCredential.count({
        where: { expiresAt: { not: null, lte: new Date() } },
      }),
    };

    return NextResponse.json({ accounts, stats });
  } catch (error: any) {
    console.error('[GET /api/admin/ad-accounts]', error);
    return NextResponse.json({ error: 'Failed to fetch ad accounts' }, { status: 500 });
  }
}
