import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { MetaAdsService } from './meta-ads.service';
import { GoogleAdsService } from './google-ads.service';
import { AdPlatform, AdStatus } from '@/app/generated/prisma/client';

export interface LaunchPayload {
  campaignId: string;
  businessId: string;
  landingUrl: string;
  facebookPageId?: string;
  keywords?: string[];
  /** Override the default ad account for this launch */
  adAccountId?: string;
}

/**
 * CampaignLauncherService
 *
 * Orchestrates a full campaign launch across Meta and/or Google Ads.
 * Called by the CampaignLaunchWorker (background job).
 *
 * Flow:
 *  1. Load campaign + ad sets + ads + ad variants from DB
 *  2. Resolve platform credentials from SocialAccount / ThirdPartyService
 *  3. Call the appropriate platform service (MetaAdsService / GoogleAdsService)
 *  4. Persist platform IDs back to DB
 *  5. Update campaign status → ACTIVE
 */
export class CampaignLauncherService {
  static async launch(payload: LaunchPayload): Promise<void> {
    const { campaignId, businessId, landingUrl, facebookPageId, keywords = [] } = payload;

    // 1. Load full campaign hierarchy
    const campaign = await prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
      include: {
        adSets: {
          include: {
            ads: {
              include: {
                adVariants: true,
              },
            },
          },
        },
      },
    });

    if (campaign.businessId !== businessId) {
      throw new Error('Campaign does not belong to the specified business');
    }

    await SystemLogger.logActivity({
      action: 'CAMPAIGN_LAUNCH_STARTED',
      entity: 'Campaign',
      entityId: campaignId,
      details: { platform: campaign.platform, businessId },
    });

    const adAccountId = (payload as any).adAccountId;

    try {
      if (campaign.platform === AdPlatform.META) {
        await CampaignLauncherService.launchOnMeta(
          campaign as any,
          businessId,
          landingUrl,
          facebookPageId,
          adAccountId,
        );
      }

      if (campaign.platform === AdPlatform.GOOGLE) {
        await CampaignLauncherService.launchOnGoogle(
          campaign as any,
          businessId,
          landingUrl,
          keywords,
          adAccountId,
        );
      }

      // Mark campaign as ACTIVE in DB
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: AdStatus.ACTIVE },
      });

      await SystemLogger.logActivity({
        action: 'CAMPAIGN_LAUNCH_SUCCEEDED',
        entity: 'Campaign',
        entityId: campaignId,
        details: { platform: campaign.platform },
      });
    } catch (err: any) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: AdStatus.DRAFT },
      });
      await SystemLogger.logError({
        message: `Campaign launch failed: ${err.message}`,
        source: 'CampaignLauncherService',
        context: { campaignId },
      });
      throw err;
    }
  }

  // ─── Meta ────────────────────────────────────────────────────────────────────

  private static async launchOnMeta(
    campaign: any,
    businessId: string,
    landingUrl: string,
    facebookPageId?: string,
    adAccountId?: string,
  ) {
    const creds = await CampaignLauncherService.getMetaCredentials(businessId, adAccountId);
    const meta = new MetaAdsService(creds.accessToken, creds.adAccountId);

    // Create the top-level campaign
    const metaCampaignId = await meta.createCampaign(campaign);
    await prisma.campaign.update({ where: { id: campaign.id }, data: { platformId: metaCampaignId } });

    for (const adSet of campaign.adSets) {
      const metaAdSetId = await meta.createAdSet(metaCampaignId, { ...adSet, campaign });
      await prisma.adSet.update({ where: { id: adSet.id }, data: { platformId: metaAdSetId } });

      for (const ad of adSet.ads) {
        const winnerVariant = ad.adVariants.find((v: any) => v.isWinner) ?? ad.adVariants[0];
        if (!winnerVariant) continue;

        const pageId = facebookPageId ?? creds.pageId ?? '';
        const creativeId = await meta.createAdCreative(winnerVariant, pageId, landingUrl);
        const metaAdId = await meta.createAd(metaAdSetId, ad, creativeId);

        await prisma.ad.update({ where: { id: ad.id }, data: { platformId: metaAdId, status: AdStatus.ACTIVE } });
      }
    }
  }

  // ─── Google ──────────────────────────────────────────────────────────────────

  private static async launchOnGoogle(
    campaign: any,
    businessId: string,
    landingUrl: string,
    keywords: string[],
    adAccountId?: string,
  ) {
    const creds = await CampaignLauncherService.getGoogleCredentials(businessId, adAccountId);
    const google = new GoogleAdsService(creds.developerToken, creds.customerId, creds.accessToken);

    // Create budget first
    const budgetResource = await google.createBudget(
      Math.round((campaign.dailyBudget ?? 10) * 1_000_000), // micros
      `${campaign.name} Budget`,
    );

    // Create campaign (we'd attach the budget resource — simplified here)
    const campaignResource = await google.createCampaign(campaign);
    await prisma.campaign.update({ where: { id: campaign.id }, data: { platformId: campaignResource } });

    for (const adSet of campaign.adSets) {
      const adGroupResource = await google.createAdGroup(campaignResource, adSet);
      await prisma.adSet.update({ where: { id: adSet.id }, data: { platformId: adGroupResource } });

      if (keywords.length > 0) {
        await google.addKeywords(adGroupResource, keywords);
      }

      const allVariants = adSet.ads.flatMap((ad: any) => ad.adVariants);
      if (allVariants.length > 0) {
        const adResourceName = await google.createResponsiveSearchAd(adGroupResource, allVariants, landingUrl);
        for (const ad of adSet.ads) {
          await prisma.ad.update({ where: { id: ad.id }, data: { platformId: adResourceName, status: AdStatus.ACTIVE } });
        }
      }
    }
  }

  // ─── Credentials Resolver ────────────────────────────────────────────────────

  /**
   * Resolves Meta credentials from the linked SocialAccount (access token)
   * and ThirdPartyService (app-level keys + ad account ID).
   */
  private static async getMetaCredentials(businessId: string, adAccountId?: string): Promise<{
    accessToken: string;
    adAccountId: string;
    pageId?: string;
  }> {
    const platformCred = await prisma.platformCredential.findFirst({
      where: { businessId, platform: 'META' as any },
      orderBy: { createdAt: 'desc' },
    });

    const socialAccount = await prisma.socialAccount.findFirst({ where: { businessId, platform: 'FACEBOOK' as any, isActive: true }, select: { accessToken: true, platformId: true } });

    const accessToken = platformCred?.accessToken ?? socialAccount?.accessToken;
    if (!accessToken) throw new Error('Meta access token not found. Please connect your Facebook account under Social Accounts.');

    // Resolve ad account: explicit override > primary > env > credential meta
    const credMeta = platformCred?.meta as { adAccountId?: string; pageId?: string } | null;

    let resolvedAccountId = adAccountId;
    if (!resolvedAccountId) {
      const primary = await prisma.adAccount.findFirst({ where: { businessId, platform: 'META' as any, isPrimary: true } });
      resolvedAccountId = primary?.platformAccountId ?? process.env.META_AD_ACCOUNT_ID ?? credMeta?.adAccountId ?? '';
    }
    if (!resolvedAccountId) throw new Error('Meta Ad Account ID not configured. Add it under Settings → Ads → Meta.');

    let pageId: string | undefined;
    if (resolvedAccountId) {
      const selected = await prisma.adAccount.findFirst({ where: { businessId, platform: 'META' as any, platformAccountId: resolvedAccountId } });
      pageId = selected?.pageId ?? credMeta?.pageId;
    }

    return { accessToken, adAccountId: resolvedAccountId, pageId };
  }

  /**
   * Resolves Google Ads credentials from ThirdPartyService.
   * apiKey = developer token, apiSecret = customer ID, accessToken from SocialAccount.
   */
  private static async getGoogleCredentials(businessId: string, adAccountId?: string): Promise<{
    developerToken: string;
    customerId: string;
    accessToken: string;
  }> {
    const platformCred = await prisma.platformCredential.findFirst({
      where: { businessId, platform: 'GOOGLE' as any },
      orderBy: { createdAt: 'desc' },
    });

    const socialAccount = await prisma.socialAccount.findFirst({ where: { businessId, platform: 'GOOGLE_BUSINESS' as any, isActive: true }, select: { accessToken: true } });
    const thirdParty = await prisma.thirdPartyService.findFirst({ where: { businessId, platform: 'GOOGLE_BUSINESS' as any, isActive: true } });

    const accessToken = platformCred?.accessToken ?? socialAccount?.accessToken;
    if (!accessToken) throw new Error('Google access token not found. Please connect your Google account under Social Accounts.');

    const developerToken = thirdParty?.apiKey ?? process.env.GOOGLE_DEVELOPER_TOKEN;
    if (!developerToken) throw new Error('Google Ads developer token not configured. Add it under Settings → Ads → Google.');

    const credMeta = platformCred?.meta as { customerId?: string } | null;

    let customerId = adAccountId;
    if (!customerId) {
      const primary = await prisma.adAccount.findFirst({ where: { businessId, platform: 'GOOGLE' as any, isPrimary: true } });
      customerId = primary?.platformAccountId ?? thirdParty?.apiSecret ?? credMeta?.customerId ?? '';
    }
    if (!customerId) throw new Error('Google Ads customer ID not configured.');

    return { developerToken, customerId, accessToken };
  }
}
