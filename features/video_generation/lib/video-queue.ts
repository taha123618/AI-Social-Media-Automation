import { QueueManager, QUEUE_NAMES } from '@/features/scheduler/config/queue.config';
import { SystemLogger } from '@/features/system/services/logger.service';

export interface VideoStatusCheckJob {
  jobId: string;
  businessId: string;
  priority?: number;
}

/**
 * Add a video status check job to the queue
 */
export async function addVideoStatusJob(jobData: VideoStatusCheckJob, options?: { priority?: number; delay?: number; attempts?: number }) {
  const videoStatusQueue = QueueManager.getQueue(QUEUE_NAMES.VIDEO_STATUS);
  await videoStatusQueue.add('check-status', jobData, {
    priority: options?.priority || 1,
    delay: options?.delay || 0,
    attempts: options?.attempts || 3,
  });

  await SystemLogger.logActivity({
    action: "VIDEO_STATUS_CHECK_ENQUEUED",
    entity: "VideoGeneration",
    entityId: jobData.jobId,
    details: { businessId: jobData.businessId, delay: options?.delay || 0 }
  });

  console.log(`📋 [QUEUE] Added video status check job ${jobData.jobId} to queue (delay: ${options?.delay || 0}ms)`);
}
