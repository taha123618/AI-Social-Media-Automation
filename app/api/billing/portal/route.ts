import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/features/billing/services/billing.service';

/**
 * POST /api/billing/portal
 * Generates a Stripe Customer Portal URL for self-service invoice and card management.
 */
export async function POST(request: NextRequest) {
  try {
    const { businessId, returnUrl } = await request.json();

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const defaultReturnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`;
    const result = await BillingService.createPortalSession(businessId, returnUrl || defaultReturnUrl);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create customer portal session', message: error?.message },
      { status: 400 }
    );
  }
}
