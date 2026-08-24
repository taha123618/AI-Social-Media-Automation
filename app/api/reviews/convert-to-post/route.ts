import { NextRequest, NextResponse } from 'next/server';
import { convertReviewToPostDraft, bulkConvertReviewsToPosts } from '@/features/organization/services/review-to-post-converter.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * POST /api/reviews/convert-to-post
 * Convert a positive review into a social media post
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
    const { reviewId, businessId, platforms } = body;

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

    // Convert review to post
    const post = await convertReviewToPostDraft({
      reviewId,
      businessId,
      platforms
    });

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Failed to convert review to post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert review' },
      { status: 400 }
    );
  }
}

/**
 * GET /api/reviews/convertible
 * Get positive reviews that can be converted to posts
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

    // Get positive reviews not yet converted
    const convertibleReviews = await prisma.review.findMany({
      where: {
        businessId,
        rating: { gte: 4 },
        convertedToPost: false
      },
      orderBy: { reviewDate: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      data: convertibleReviews
    });
  } catch (error) {
    console.error('Failed to get convertible reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
