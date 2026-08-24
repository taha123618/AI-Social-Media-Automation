import { NextResponse } from 'next/server';
import { BillingService } from '@/features/billing/services/billing.service';

/**
 * GET /api/billing/plans
 * Public endpoint exposing configuration-driven plan definitions, pricing, and feature limits.
 */
export async function GET() {
  try {
    const plans = BillingService.getPlans();
    return NextResponse.json({ plans }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve plans', message: error?.message },
      { status: 500 }
    );
  }
}
