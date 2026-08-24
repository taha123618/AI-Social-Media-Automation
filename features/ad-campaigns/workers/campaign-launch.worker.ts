import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import { AD_LAUNCH_QUEUE_NAME } from '../lib/ad-launch-queue';
import { CampaignLauncherService, LaunchPayload } from '../services/campaign-launcher.service';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * CampaignLaunchWorker
 *
 * Picks up jobs from the ad-campaign-launch-queue and delegates
 * to CampaignLauncherService which calls the real Meta / Google APIs.
 */
export class CampaignLaunchWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      AD_LAUNCH_QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: 1, // Rate-limited — one launch at a time per worker
        limiter: { max: 5, duration: 60_000 }, // max 5 launches per minute
      },
    );

    this.worker.on('completed', job => {
      console.log(`[LaunchWorker] Job ${job.id} completed — campaign ${job.data?.campaignId}`);
      SystemLogger.logQueue({
        queueName: AD_LAUNCH_QUEUE_NAME,
        jobId: job.id!,
        status: 'SUCCESS',
        message: `Campaign ${job.data?.campaignId} launched successfully.`,
      });
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[LaunchWorker] Job ${job?.id} failed:`, err.message);
      SystemLogger.logQueue({
        queueName: AD_LAUNCH_QUEUE_NAME,
        jobId: job?.id ?? 'unknown',
        status: 'FAILURE',
        message: `Campaign launch failed: ${err.message}`,
        error: err,
      });
    });
  }

  private async processJob(job: Job<LaunchPayload>) {
    const payload = job.data;
    console.log(`[LaunchWorker] Launching campaign ${payload.campaignId} on platform…`);
    await job.updateProgress(10);

    await CampaignLauncherService.launch(payload);
    await job.updateProgress(100);

    return { success: true, campaignId: payload.campaignId };
  }

  async close() {
    await this.worker.close();
  }
}

// Start if run directly via `npx tsx` / `node`
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new CampaignLaunchWorker();
  console.log('[Worker] Campaign Launch Worker started');
  process.on('SIGINT', async () => {
    await worker.close();
    process.exit(0);
  });
}
