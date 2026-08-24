import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { adLaunchQueue } from '@/features/ad-campaigns/lib/ad-launch-queue';
import { z } from 'zod';

const LaunchSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID required'),
  landingUrl: z.string().url('A valid landing page URL is required'),
  facebookPageId: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  adAccountId: z.string().optional(),
});

/**
 * POST /api/ad-campaigns/launch
 *
 * Validates the request, verifies business ownership of the campaign,
 * then enqueues a background job to call the real Meta / Google APIs.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = LaunchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { campaignId, landingUrl, facebookPageId, keywords, adAccountId } = parsed.data;

    // Verify campaign belongs to this business and is in a launchable state
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, businessId },
      select: { id: true, name: true, status: true, platform: true },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Campaign is already active' },
        { status: 409 },
      );
    }

    // Mark as PENDING_REVIEW while the worker runs
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PENDING_REVIEW' },
    });

    const job = await adLaunchQueue.add('launch-campaign', {
      campaignId,
      businessId,
      landingUrl,
      facebookPageId,
      keywords: keywords ?? [],
      adAccountId,
    });

    await SystemLogger.logActivity({
      action: 'CAMPAIGN_LAUNCH_QUEUED',
      entity: 'Campaign',
      entityId: campaignId,
      userId: session.user.id,
      details: { businessId, platform: campaign.platform, jobId: job.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Campaign "${campaign.name}" launch queued`,
        jobId: job.id,
        campaignId,
      },
      { status: 202 },
    );
  } catch (error: any) {
    await SystemLogger.logError({
      message: `Error queuing campaign launch: ${error.message}`,
      source: 'POST /api/ad-campaigns/launch',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to queue campaign launch' },
      { status: 500 },
    );
  }
}
