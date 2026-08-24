import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG, QUEUE_NAMES } from '../config/queue.config';
import { GenerationService } from '@/features/generation/services/generation.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

console.log(`[Worker] Initializing ${QUEUE_NAMES.GENERATION} worker...`);

const worker = new Worker(
  QUEUE_NAMES.GENERATION,
  async (job: Job) => {
    console.log(`[Job ${job.id}] Processing content generation...`, job.data);
    const { businessId, creatorId, intent, platforms, topic, customInstructions, draftId } = job.data;

    try {
      await SystemLogger.logActivity({
        action: "CONTENT_GENERATION_STARTED",
        entity: "ContentDraft",
        userId: creatorId,
        details: { businessId, platforms, topic, queueJobId: job.id }
      });

      const draft = await GenerationService.generateDraft(businessId, creatorId, {
        intent,
        platforms,
        topic,
        customInstructions,
        draftId
      });

      console.log(`[Job ${job.id}] Generation complete. Draft ID: ${draft.id}`);

      await SystemLogger.logActivity({
        action: "CONTENT_GENERATION_COMPLETED",
        entity: "ContentDraft",
        entityId: draft.id,
        userId: creatorId,
        details: { businessId, queueJobId: job.id }
      });

      return { draftId: draft.id, status: 'SUCCESS' };

    } catch (error: any) {
      console.error(`[Job ${job.id}] Failed:`, error);

      await SystemLogger.logError({
        message: error.message || "Content generation worker failed",
        source: "GenerationWorker",
        context: { jobId: job.id, businessId, draftId }
      });

      // Log failure to prisma DB (legacy)
      await prisma.jobLog.create({
        data: {
          jobId: job.id || 'unknown',
          queueName: QUEUE_NAMES.GENERATION,
          status: 'FAILED',
          error: error.message
        }
      });

      throw error;
    }
  },
  {
    connection: REDIS_CONNECTION_CONFIG,
    concurrency: 5, // Process 5 jobs in parallel
  }
);

worker.on('completed', async (job) => {
  console.log(`[Job ${job.id}] Completed!`);
  // Log job completion
  await SystemLogger.logActivity({
    action: "JOB_COMPLETED",
    entity: "QueueJob",
    entityId: job.id,
    details: { queueName: QUEUE_NAMES.GENERATION }
  });

  await prisma.jobLog.create({
    data: {
      jobId: job.id || 'unknown',
      queueName: QUEUE_NAMES.GENERATION,
      status: 'COMPLETED',
      result: job.returnvalue
    }
  });
});

worker.on('failed', async (job, err) => {
  console.error(`[Job ${job?.id}] Failed permanently: ${err.message}`);

  await SystemLogger.logError({
    message: `Job ${job?.id} failed permanently: ${err.message}`,
    source: `Worker.${QUEUE_NAMES.GENERATION}`,
    context: { jobId: job?.id, queueName: QUEUE_NAMES.GENERATION }
  });
});

export default worker;
