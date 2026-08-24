import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

/**
 * GET /api/admin/billing/webhooks
 * Admin route to audit received Stripe webhook events and errors.
 */
export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('admin_token')?.value;
    const adminSession = adminToken ? await verifyAdminToken(adminToken) : null;

    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const events = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve webhook events', message: error?.message },
      { status: 500 }
    );
  }
}
