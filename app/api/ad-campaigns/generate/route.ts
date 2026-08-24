import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { CampaignBriefSchema } from '@/features/ad-campaigns/services/ai-copy.service';
import { adGenerationQueue } from '@/features/ad-campaigns/lib/ad-queue';
import { CampaignObjective, AdPlatform, AdStatus } from '@/app/generated/prisma/client';

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
    const parseResult = CampaignBriefSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: 'Invalid brief parameters', details: parseResult.error.format() }, { status: 400 });
    }

    const brief = parseResult.data;

    // Create Campaign -> AdSet -> Ad hierarchy for this generation
    const campaign = await prisma.campaign.create({
      data: {
        businessId,
        name: `${brief.productName} Campaign`,
        objective: brief.objective.toUpperCase() as CampaignObjective || CampaignObjective.AWARENESS,
        platform: brief.platform === 'BOTH' ? AdPlatform.META : (brief.platform as AdPlatform),
        status: AdStatus.DRAFT,
        adSets: {
          create: {
            name: 'AI Generated Ad Set',
            status: AdStatus.DRAFT,
            ads: {
              create: {
                name: 'AI Generated Ad',
                status: AdStatus.DRAFT,
              }
            }
          }
        }
      },
      include: {
        adSets: {
          include: {
            ads: true
          }
        }
      }
    });

    const adId = campaign.adSets[0].ads[0].id;

    // Queue the job
    await adGenerationQueue.add('generate-ad-variants', {
      adId,
      businessId,
      brief
    });

    await SystemLogger.logActivity({
      action: 'AD_GENERATION_QUEUED',
      entity: 'campaign',
      entityId: campaign.id,
      userId: session.user.id,
      details: { businessId, brief },
    });

    return NextResponse.json({ success: true, adId, campaignId: campaign.id, message: 'Ad generation queued' }, { status: 202 });
  } catch (error: any) {
    await SystemLogger.logError({
      message: `Error queuing ad generation: ${error.message}`,
      source: 'POST /api/ad-campaigns/generate',
    });

    return NextResponse.json(
      { success: false, error: 'Failed to queue ad generation' },
      { status: 500 }
    );
  }
}
