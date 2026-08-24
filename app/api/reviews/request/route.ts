import { NextRequest, NextResponse } from 'next/server';
import { sendReviewRequest, bulkSendReviewRequests, getReviewRequestStats } from '@/features/organization/services/review-request.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * POST /api/reviews/request
 * Send a review request to a customer
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { businessId, customerName, customerEmail, customerPhone, channel, message } = body;

    // Validate required fields based on channel
    if (!businessId || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId and customerName are required' },
        { status: 400 }
      );
    }

    // Channel-specific validation
    const selectedChannel = channel || 'EMAIL';
    if (selectedChannel === 'EMAIL' && !customerEmail) {
      return NextResponse.json(
        { error: 'Email is required for email delivery' },
        { status: 400 }
      );
    }

    if (selectedChannel === 'SMS' && !customerPhone) {
      return NextResponse.json(
        { error: 'Phone number is required for SMS delivery' },
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

    // Send review request
    const result = await sendReviewRequest({
      businessId,
      customerName,
      customerEmail: selectedChannel === 'EMAIL' ? customerEmail : '',
      customerPhone: selectedChannel === 'SMS' ? customerPhone : undefined,
      channel: selectedChannel,
      message
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to send review request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to send review request', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/stats
 * Get review request statistics
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

    const stats = await getReviewRequestStats(businessId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get review stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
