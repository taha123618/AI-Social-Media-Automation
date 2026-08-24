import { NextResponse } from 'next/server';
import { EngagementAutomationService } from '@/features/social/services/engagement-automation.service';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';

export async function POST(request: Request) {
  try {
    const { businessId: bodyBusinessId } = await request.json().catch(() => ({}));
    const defaultId = await getActiveWorkspaceIdSafe().catch(() => undefined);
    const businessId = bodyBusinessId || defaultId;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const result = await EngagementAutomationService.processNewEngagement(businessId);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Engagement processed successfully',
        results: result.results 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to process engagement' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Engagement Process API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
