import { NextRequest, NextResponse } from 'next/server';
import { EntitlementService } from '@/features/billing/services/entitlement.service';
import { PLANS } from '@/features/billing/config/plans.config';

/**
 * GET /api/billing/entitlements?businessId=xyz
 * Returns resolved plan entitlements and feature capabilities for the active workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId =
      searchParams.get('businessId') ||
      req.headers.get('x-business-id');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const planId = await EntitlementService.resolvePlanForBusiness(businessId);
    const plan = PLANS[planId] || PLANS.free;

    return NextResponse.json({
      success: true,
      businessId,
      plan: {
        id: plan.id,
        name: plan.name,
        tier: plan.tier,
        features: plan.features,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve entitlements', message: error?.message },
      { status: 500 }
    );
  }
}
