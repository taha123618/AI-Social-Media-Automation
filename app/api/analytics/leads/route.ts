import { NextRequest, NextResponse } from 'next/server';
import { getLeadSummary, getPostConversionRate } from '@/features/analytics/services/lead-tracking.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/leads
 * Get lead summary for a business
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
    const days = parseInt(searchParams.get('days') || '30');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Verify access
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

    // Get lead summary
    const summary = await getLeadSummary(businessId, days);
    const conversionRate = await getPostConversionRate(businessId, days);

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        conversionRate
      }
    });
  } catch (error) {
    console.error('Failed to get lead summary:', error);
    return NextResponse.json(
      { error: 'Failed to get lead summary' },
      { status: 500 }
    );
  }
}
