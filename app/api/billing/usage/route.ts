import { NextRequest, NextResponse } from 'next/server';
import { UsageService } from '@/features/billing/services/usage.service';

/**
 * GET /api/billing/usage?businessId=xyz
 * Returns real-time usage consumption and quota breakdown for the active workspace.
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

    const usageSummary = await UsageService.getUsageSummary(businessId);

    return NextResponse.json({
      success: true,
      businessId,
      usage: usageSummary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve usage data', message: error?.message },
      { status: 500 }
    );
  }
}
