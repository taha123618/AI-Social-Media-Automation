import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/features/billing/services/billing.service';

/**
 * POST /api/billing/reactivate
 * Reactivates a subscription that was scheduled for cancellation.
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

    await BillingService.reactivateSubscription(businessId);

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully reactivated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to reactivate subscription', message: error?.message },
      { status: 400 }
    );
  }
}
