import { NextRequest, NextResponse } from 'next/server';
import { calculateRevenueAttribution, getChannelROI, calculateMultiTouchAttribution } from '@/features/analytics/services/revenue-attribution.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { EntitlementGuard } from '@/lib/guards/entitlement.guard';

/**
 * GET /api/analytics/revenue
 * Get revenue attribution data for a business (requires advanced_analytics entitlement).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const days = parseInt(searchParams.get('days') || '90');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Verify workspace access
    const businessMember = await prisma.businessMember.findFirst({
      where: {
        businessId,
        userId: session.user.id
      }
    });

    if (!businessMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Enforce Advanced Analytics Entitlement
    const featureError = await EntitlementGuard.requireFeature(businessId, 'advanced_analytics');
    if (featureError) {
      return featureError;
    }

    // Calculate revenue attribution
    const attribution = await calculateRevenueAttribution(businessId, days);
    const channelROI = await getChannelROI(businessId, days);
    const multiTouch = await calculateMultiTouchAttribution(businessId, days);

    return NextResponse.json({
      success: true,
      data: {
        attribution,
        channelROI,
        multiTouch
      }
    });
  } catch (error) {
    console.error('Failed to calculate revenue attribution:', error);
    return NextResponse.json(
      { error: 'Failed to calculate revenue attribution' },
      { status: 500 }
    );
  }
}
