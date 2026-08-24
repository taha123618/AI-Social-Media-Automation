import { QueueManager, QUEUE_NAMES } from '@/features/scheduler/config/queue.config';
import { SystemLogger } from '@/features/system/services/logger.service';

export interface ImageStatusCheckJob {
  jobId: string;
  businessId?: string;
  priority?: number;
}

/**
 * Add an image status check job to the queue
 */
export async function addImageStatusJob(jobData: ImageStatusCheckJob, options?: { priority?: number; delay?: number; attempts?: number }) {
  const imageStatusQueue = QueueManager.getQueue(QUEUE_NAMES.IMAGE_STATUS);
  await imageStatusQueue.add('check-image-status', jobData, {
    priority: options?.priority || 1,
    delay: options?.delay || 0,
    attempts: options?.attempts || 3,
  });

  await SystemLogger.logActivity({
    action: "IMAGE_STATUS_CHECK_ENQUEUED",
    entity: "ImageGeneration",
    entityId: jobData.jobId,
    details: { businessId: jobData.businessId, delay: options?.delay || 0 }
  });

  console.log(`📋 [QUEUE] Added image status check job ${jobData.jobId} to queue (delay: ${options?.delay || 0}ms)`);
}
