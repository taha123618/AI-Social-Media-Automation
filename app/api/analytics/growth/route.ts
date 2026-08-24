import { NextResponse } from 'next/server';
import { GrowthAnalyticsService } from '@/features/analytics/services/growth-analytics.service';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || await getActiveWorkspaceIdSafe().catch(() => undefined);

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const growthData = await GrowthAnalyticsService.getGrowthDashboard(businessId);

    return NextResponse.json(growthData);
  } catch (error) {
    console.error('Growth Analytics API Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
