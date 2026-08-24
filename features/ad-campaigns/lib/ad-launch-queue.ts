import { Queue } from 'bullmq';
import { REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';

export const AD_LAUNCH_QUEUE_NAME = 'ad-campaign-launch-queue';
export const AD_SYNC_QUEUE_NAME = 'ad-performance-sync-queue';

export const adLaunchQueue = new Queue(AD_LAUNCH_QUEUE_NAME, {
  connection: REDIS_CONNECTION_CONFIG,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const adSyncQueue = new Queue(AD_SYNC_QUEUE_NAME, {
  connection: REDIS_CONNECTION_CONFIG,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 10_000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});
