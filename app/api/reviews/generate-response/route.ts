import { NextRequest, NextResponse } from 'next/server';
import { generateReviewResponse, bulkGenerateResponses } from '@/features/organization/services/review-response-generator.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * POST /api/reviews/generate-response
 * Generate AI response to a specific review
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, businessId } = body;

    if (!reviewId || !businessId) {
      return NextResponse.json(
        { error: 'Review ID and Business ID required' },
        { status: 400 }
      );
    }

    // Verify user has access to this business
    const businessMember = await prisma.businessMember.findFirst({
      where: {
        businessId,
        userId: session.user.id
      }
    });

    if (!businessMember) {
      return NextResponse.json(
        { error: 'Access denied to this business' },
        { status: 403 }
      );
    }

    // Generate response
    const response = await generateReviewResponse({
      reviewId,
      businessId
    });

    // Save response to database so it updates the Review object
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        responseText: response.responseText,
        respondedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Failed to generate review response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/pending-responses
 * Get reviews that need responses
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

    // Get reviews without responses
    const pendingReviews = await prisma.review.findMany({
      where: {
        businessId,
        responseText: null
      },
      orderBy: { reviewDate: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      data: pendingReviews
    });
  } catch (error) {
    console.error('Failed to get pending reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
