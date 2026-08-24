import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { trackLead } from '@/features/analytics/services/lead-tracking.service';

/**
 * GET /api/track
 * Tracks a click/lead and redirects to the target URL
 * Query params:
 * - url: The destination URL (encoded)
 * - postId: The source post ID
 * - businessId: The business ID
 * - type: The lead type (PHONE_CALL, MESSAGE, WEBSITE_VISIT, BOOKING, DIRECTIONS)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const postId = searchParams.get('postId');
  const businessId = searchParams.get('businessId');
  const leadType = (searchParams.get('type') || 'WEBSITE_VISIT') as any;

  if (!targetUrl) {
    return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
  }

  // Track the lead asynchronously
  if (postId && businessId) {
    trackLead({
      postId,
      businessId,
      leadType,
      metadata: {
        source: 'TRACKING_LINK',
      }
    }).catch(err => {
      console.error('Failed to track lead in redirector:', err);
    });
  }

  // Redirect to the destination
  return NextResponse.redirect(new URL(targetUrl));
}
