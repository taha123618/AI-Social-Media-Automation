import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/features/billing/services/billing.service';

/**
 * POST /api/billing/cancel
 * Schedules subscription cancellation at the end of the current billing cycle.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessId =
      body?.businessId ||
      req.headers.get('x-business-id');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    await BillingService.cancelSubscription(businessId);

    return NextResponse.json({
      success: true,
      message: 'Subscription scheduled for cancellation at period end.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to cancel subscription', message: error?.message },
      { status: 400 }
    );
  }
}
