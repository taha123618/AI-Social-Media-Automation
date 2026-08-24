import prisma from '@/lib/prisma';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import { Platform } from '@/app/generated/prisma/client';


/**
 * Hourly cron job to refresh social media metrics for active posts
 * Implements batch processing to handle scaling and API rate limits
 */

const BATCH_SIZE = 5;
const SYNC_WINDOW_DAYS = 30;

async function syncSocialMetrics() {
  const startTime = Date.now();
  const jobName = 'SocialMetricsSync';

  SystemLogger.logCron(jobName, 'START');
  console.log('---------------------------------------------------------');
  console.log(`[${new Date().toISOString()}] Starting social metrics sync...`);
  console.log('---------------------------------------------------------');

  try {
    // 1. Fetch posts published in the last SYNC_WINDOW_DAYS that have external IDs
    const syncCutoff = new Date();
    syncCutoff.setDate(syncCutoff.getDate() - SYNC_WINDOW_DAYS);

    const posts = await prisma.post.findMany({
      where: {
        postedAt: { gte: syncCutoff },
        externalPostId: { not: null },
      },
      include: {
        socialAccount: true
      }
    });

    const foundMessage = `Found ${posts.length} posts to sync`;
    console.log(`[CRON] ${foundMessage}`);
    SystemLogger.logCron(jobName, 'SUCCESS', { message: foundMessage });

    let successCount = 0;
    let errorCount = 0;

    // Process in batches to balance speed and rate limits
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE);
      const batchMessage = `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(posts.length / BATCH_SIZE)}`;
      console.log(`[CRON] ${batchMessage}`);

      await Promise.allSettled(batch.map(async (post) => {
        try {
          // Ensure we have a valid access token
          const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(post.socialAccount!);

          let metrics;
          if (post.platform === Platform.INSTAGRAM) {
            metrics = await MetaBusinessManagerService.getInstagramMediaInsights(post.externalPostId!, accessToken);
          } else if (post.platform === Platform.FACEBOOK) {
            metrics = await MetaBusinessManagerService.getFacebookPostInsights(post.externalPostId!, accessToken);
          }

          if (metrics) {
            await prisma.post.update({
              where: { id: post.id },
              data: {
                likes: metrics.engagement?.likes || 0,
                comments: metrics.engagement?.comments || 0,
                shares: metrics.engagement?.shares || 0,
                reach: metrics.reach?.reach || 0,
                impressions: metrics.reach?.impressions || 0,
                saves: metrics.engagement?.saves || 0,
                profileVisits: metrics.reach?.profileVisits || 0,
                analyticsUpdatedAt: new Date()
              }
            });
            successCount++;
          }
        } catch (err: any) {
          const errMsg = `Error syncing metrics for post ${post.id} (${post.platform}): ${err.message}`;
          console.error(`[CRON] ${errMsg}`);
          errorCount++;

          SystemLogger.logCron(jobName, 'FAILURE', {
            message: errMsg,
            error: err
          });
        }
      }));

      // Small throttle between batches to avoid Meta rate limits
      if (i + BATCH_SIZE < posts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const duration = Date.now() - startTime;
    const summaryMessage = `Sync Complete. Success: ${successCount}, Errors: ${errorCount}`;
    console.log('---------------------------------------------------------');
    console.log(`[CRON] ${summaryMessage} (duration: ${(duration / 1000).toFixed(2)}s)`);
    console.log('---------------------------------------------------------');

    SystemLogger.logCron(jobName, 'SUCCESS', {
      message: summaryMessage,
      duration
    });

  } catch (error) {
    const fatalMsg = `Fatal error in social metrics sync: ${error}`;
    console.error(`[CRON] ${fatalMsg}`);

    SystemLogger.logCron(jobName, 'FAILURE', {
      message: fatalMsg,
      error
    });
  } finally {

    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the sync
syncSocialMetrics();
