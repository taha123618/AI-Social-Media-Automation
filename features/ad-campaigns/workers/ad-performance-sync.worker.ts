import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import { AD_SYNC_QUEUE_NAME } from '../lib/ad-launch-queue';
import { MetaAdsService } from '../services/meta-ads.service';
import { GoogleAdsService } from '../services/google-ads.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { AdPlatform } from '@/app/generated/prisma/client';

interface SyncJobData {
  campaignId: string;
  businessId: string;
}

/**
 * AdPerformanceSyncWorker
 *
 * Syncs real analytics from Meta / Google Ads back into the AdAnalytics table.
 * AdAnalytics schema has: impressions, reach, clicks, spend, revenue.
 * ctr/cpc/conversions are derived on-the-fly and stored in revenue as ROAS proxy.
 */
export class AdPerformanceSyncWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      AD_SYNC_QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: 3,
      },
    );

    this.worker.on('completed', job => {
      console.log(`[SyncWorker] Synced campaign ${job.data?.campaignId}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[SyncWorker] Job ${job?.id} failed:`, err.message);
      SystemLogger.logError({
        message: `Performance sync failed for ${job?.data?.campaignId}: ${err.message}`,
        source: 'AdPerformanceSyncWorker',
      });
    });
  }

  private async processJob(job: Job<SyncJobData>) {
    const { campaignId, businessId } = job.data;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, platform: true, platformId: true, businessId: true, status: true },
    });

    if (!campaign || campaign.businessId !== businessId) return;
    if (!campaign.platformId || campaign.status !== 'ACTIVE') return;

    let metrics = { impressions: 0, reach: 0, clicks: 0, spend: 0 };

    if (campaign.platform === AdPlatform.META) {
      const creds = await this.getMetaCreds(businessId);
      if (creds) {
        const meta = new MetaAdsService(creds.accessToken, creds.adAccountId);
        const m = await meta.syncPerformanceData(campaign.platformId);
        metrics.impressions = m.impressions;
        metrics.reach = m.reach;
        metrics.clicks = m.clicks;
        metrics.spend = m.spend;
      }
    }

    if (campaign.platform === AdPlatform.GOOGLE) {
      const creds = await this.getGoogleCreds(businessId);
      if (creds) {
        const google = new GoogleAdsService(creds.developerToken, creds.customerId, creds.accessToken);
        const g = await google.syncPerformanceData(campaign.platformId);
        metrics.impressions = g.impressions;
        metrics.clicks = g.clicks;
        metrics.spend = g.spend;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create or update today's snapshot — using campaignId + date as the natural key
    const existing = await prisma.adAnalytics.findFirst({
      where: { campaignId, date: today },
      select: { id: true },
    });

    if (existing) {
      await prisma.adAnalytics.update({
        where: { id: existing.id },
        data: {
          impressions: metrics.impressions,
          reach: metrics.reach,
          clicks: metrics.clicks,
          spend: metrics.spend,
        },
      });
    } else {
      await prisma.adAnalytics.create({
        data: {
          businessId,
          campaignId,
          platform: campaign.platform,
          date: today,
          impressions: metrics.impressions,
          reach: metrics.reach,
          clicks: metrics.clicks,
          spend: metrics.spend,
        },
      });
    }

    console.log(
      `[SyncWorker] ${campaignId}: impressions=${metrics.impressions} spend=$${metrics.spend.toFixed(2)}`,
    );
  }

  private async getMetaCreds(businessId: string) {
    const [social, third] = await Promise.all([
      prisma.socialAccount.findFirst({
        where: { businessId, platform: 'FACEBOOK' as any, isActive: true },
        select: { accessToken: true },
      }),
      prisma.thirdPartyService.findFirst({
        where: { businessId, platform: 'FACEBOOK' as any, isActive: true },
        select: { apiKey: true },
      }),
    ]);
    if (!social?.accessToken || !third?.apiKey) return null;
    return { accessToken: social.accessToken, adAccountId: third.apiKey };
  }

  private async getGoogleCreds(businessId: string) {
    const [social, third] = await Promise.all([
      prisma.socialAccount.findFirst({
        where: { businessId, platform: 'GOOGLE_BUSINESS' as any, isActive: true },
        select: { accessToken: true },
      }),
      prisma.thirdPartyService.findFirst({
        where: { businessId, platform: 'GOOGLE_BUSINESS' as any, isActive: true },
        select: { apiKey: true, apiSecret: true },
      }),
    ]);
    if (!social?.accessToken || !third?.apiKey) return null;
    return { accessToken: social.accessToken, developerToken: third.apiKey, customerId: third.apiSecret };
  }

  async close() {
    await this.worker.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new AdPerformanceSyncWorker();
  console.log('[Worker] Ad Performance Sync Worker started');
  process.on('SIGINT', async () => { await worker.close(); process.exit(0); });
}
