import { NextRequest, NextResponse } from 'next/server';
import { sendFollowUp, bulkSendFollowUps } from '@/features/organization/services/review-request.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * POST /api/reviews/request/follow-up
 * Trigger a follow-up reminder for a review request
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
    const { requestId, businessId, bulk, daysAgo } = body;

    // Verify access to business
    if (businessId) {
      const businessMember = await prisma.businessMember.findFirst({
        where: {
          businessId,
          userId: session.user.id
        }
      });

      if (!businessMember) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    if (bulk && businessId) {
      const results = await bulkSendFollowUps(businessId, daysAgo || 3);
      return NextResponse.json({
        success: true,
        message: `Processed ${results.length} follow-ups`,
        results
      });
    }

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
    }

    const result = await sendFollowUp(requestId);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

  } catch (error) {
    console.error('Failed to process follow-up:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
