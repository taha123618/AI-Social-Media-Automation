import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/features/billing/services/billing.service';

/**
 * POST /api/billing/checkout
 * Initiates a Stripe Checkout session for subscription upgrade or renewal.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await BillingService.createCheckoutSession(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error?.message },
      { status: 400 }
    );
  }
}
