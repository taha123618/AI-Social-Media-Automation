import { NextResponse } from 'next/server';
import { MultiLocationService } from '@/features/multi-location/services/multi-location.service';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || await getActiveWorkspaceIdSafe().catch(() => undefined);

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const result = await MultiLocationService.getLocations(businessId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Multi-Location API Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, businessId, locationId, settings, baseContent } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'GET_AGGREGATED_ANALYTICS': {
        const result = await MultiLocationService.getAggregatedAnalytics(businessId);
        return NextResponse.json(result);
      }
      
      case 'SYNC_CONTENT_SETTINGS': {
        const result = await MultiLocationService.syncGlobalSettings(businessId, settings);
        return NextResponse.json(result);
      }

      case 'CUSTOMIZE_FOR_LOCATION': {
        const result = await MultiLocationService.customizeContentForLocation(locationId, baseContent);
        return NextResponse.json(result);
      }

      case 'ADD_LOCATION': {
        const result = await MultiLocationService.addLocation(businessId, body.locationData);
        return NextResponse.json(result);
      }

      case 'GET_STRATEGIC_ADVICE': {
        const result = await MultiLocationService.getStrategicAdvice(businessId, body.query);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Multi-Location POST API Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
