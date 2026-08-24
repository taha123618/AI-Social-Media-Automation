import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

/**
 * GET /api/admin/billing/subscriptions
 * Admin route to list all active/past_due/canceled subscriptions across organizations.
 */
export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('admin_token')?.value;
    const adminSession = adminToken ? await verifyAdminToken(adminToken) : null;

    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        usage: true,
      },
      orderBy: { currentPeriodStart: 'desc' },
      take: 50,
    });

    return NextResponse.json({ subscriptions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve admin subscriptions', message: error?.message },
      { status: 500 }
    );
  }
}
