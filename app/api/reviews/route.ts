import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * GET /api/reviews
 * Get all reviews for a business with optional filtering
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
    const status = searchParams.get('status'); // 'pending', 'convertible', or'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
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
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Handle review requests status
    if (status === 'requests') {
      const requests = await prisma.reviewRequest.findMany({
        where: { businessId },
        orderBy: { sentAt: 'desc' },
        take: limit
      });

      return NextResponse.json({
        success: true,
        data: {
          requests,
          stats: await getStats(businessId)
        }
      });
    }

    // Build filter conditions for reviews
    const where: Record<string, any> = { businessId };

    if (status === 'pending') {
      where.responseText = null;
    } else if (status === 'convertible') {
      where.AND = [
        { rating: { gte: 4 } },
        { convertedToPost: false }
      ];
    }

    // Fetch reviews
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { reviewDate: 'desc' },
      take: limit,
      include: {
        business: {
          select: {
            name: true,
            profile: {
              select: {
                industry: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: await getStats(businessId)
      }
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

async function getStats(businessId: string) {
  const statsData = await prisma.review.groupBy({
    by: ['businessId'],
    where: { businessId },
    _count: { id: true },
    _avg: { rating: true }
  });

  const pendingCount = await prisma.review.count({
    where: {
      businessId,
      responseText: null
    }
  });

  const convertibleCount = await prisma.review.count({
    where: {
      businessId,
      rating: { gte: 4 },
      convertedToPost: false
    }
  });

  const requestCount = await prisma.reviewRequest.count({
    where: { businessId, status: 'SENT' }
  });

  return {
    total: statsData[0]?._count.id || 0,
    averageRating: statsData[0]?._avg.rating || 0,
    pendingResponses: pendingCount,
    convertibleReviews: convertibleCount,
    pendingRequests: requestCount
  };
}
