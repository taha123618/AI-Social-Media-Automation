import { NextRequest, NextResponse } from 'next/server';
import { sendOwnerResponse } from '@/features/organization/services/review-response-generator.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * POST /api/reviews/send-response
 * Email the generated owner response to the customer
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

    // Send the response
    const result = await sendOwnerResponse({
      reviewId,
      businessId
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Failed to send review response email:', error);
    return NextResponse.json(
      { error: 'Failed to send response email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
