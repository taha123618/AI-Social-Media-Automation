import { NextRequest, NextResponse } from 'next/server';
import { calculateConsistencyScore, getPostingAnalytics } from '@/features/analytics/services/consistency-scorer.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/consistency/score
 * Get consistency score for a business
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

    // Calculate consistency score
    const score = await calculateConsistencyScore(businessId, days);

    return NextResponse.json({
      success: true,
      data: score
    });
  } catch (error) {
    console.error('Failed to calculate consistency score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate consistency score' },
      { status: 500 }
    );
  }
}
