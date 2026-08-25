import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/features/billing/services/billing.service';

/**
 * GET /api/billing/subscription?businessId=xyz
 * Returns current plan, status, renewal dates, usage metrics, and Stripe billing portal link.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || request.headers.get('x-business-id') || '';

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const details = await BillingService.getBusinessSubscription(businessId);
    return NextResponse.json({ data: details }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve subscription details', message: error?.message },
      { status: 500 }
    );
  }
}
