import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * GET /api/cron/billing-reconciliation
 * Periodic cron task to reconcile expired subscription billing periods and reset monthly usage.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const now = new Date();

    // 1. Find subscriptions where currentPeriodEnd has passed but status is still ACTIVE
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        currentPeriodEnd: { lte: now },
        status: 'ACTIVE',
      },
      include: {
        usage: true,
      },
    });

    let reconciledCount = 0;

    for (const sub of expiredSubscriptions) {
      if (sub.cancelAtPeriodEnd) {
        // Mark as canceled
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'CANCELED' },
        });
      } else {
        // Advance billing period by 1 month and reset monthly usage
        const newStart = sub.currentPeriodEnd;
        const newEnd = new Date(newStart.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            currentPeriodStart: newStart,
            currentPeriodEnd: newEnd,
          },
        });

        // Reset monthly usage counters
        await prisma.subscriptionUsage.updateMany({
          where: {
            subscriptionId: sub.id,
            period: 'MONTHLY',
          },
          data: {
            used: 0,
          },
        });
      }

      reconciledCount++;
    }

    await SystemLogger.logActivity({
      action: 'BILLING_RECONCILIATION_CRON',
      entity: 'Subscription',
      entityId: 'cron_job',
      userId: 'system',
      details: { reconciledCount, timestamp: now.toISOString() },
    });

    return NextResponse.json({
      success: true,
      reconciledCount,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error during billing reconciliation cron:', error);
    await SystemLogger.logError({
      message: `Billing reconciliation cron failed: ${error?.message}`,
      source: 'app/api/cron/billing-reconciliation/route.ts',
    });

    return NextResponse.json(
      { success: false, error: error?.message || 'Reconciliation failed' },
      { status: 500 }
    );
  }
}
