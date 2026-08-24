import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG, QUEUE_NAMES, QUEUE_CONFIG } from '../../scheduler/config/queue.config';
import { generateAutopilotPlan, createDraftsFromPlan } from '../services/autopilot-generator.service';
import { SystemLogger } from '@/features/system/services/logger.service';

export class AutopilotWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QUEUE_NAMES.AUTOPILOT,
      async (job: Job) => {
        const { businessId, creatorId, days, postsPerWeek, platforms, contentMix } = job.data;

        console.log(`[AutopilotWorker] Processing job ${job.id} for business ${businessId}`);

        try {
          await SystemLogger.logActivity({
            action: 'AUTOPILOT_GENERATION_STARTED',
            entity: 'ContentDraft',
            userId: creatorId,
            details: { businessId, days, platforms, jobId: job.id }
          });
          // 1. Generate the autopilot plan
          const plan = await generateAutopilotPlan({
            businessId,
            days,
            postsPerWeek,
            platforms,
            contentMix
          });

          // 2. Create the drafts from the plan
          const drafts = await createDraftsFromPlan(plan, businessId, creatorId);

          // 3. Log the success
          await SystemLogger.logActivity({
            action: 'AUTOPILOT_DRAFTS_CREATED',
            entity: 'ContentDraft',
            userId: creatorId,
            details: {
              businessId,
              draftsCount: drafts.length,
              days,
              platforms,
              jobId: job.id
            },
          });

          await SystemLogger.logActivity({
            action: 'AUTOPILOT_GENERATION_COMPLETED',
            entity: 'ContentDraft',
            userId: creatorId,
            details: { businessId, draftsCount: drafts.length, jobId: job.id }
          });

          console.log(`[AutopilotWorker] Successfully completed job ${job.id}. Created ${drafts.length} drafts.`);

          return {
            success: true,
            draftsCreated: drafts.length,
            businessId
          };
        } catch (error) {
          console.error(`[AutopilotWorker] Job ${job.id} failed:`, error);

          await SystemLogger.logError({
            message: error instanceof Error ? error.message : 'Autopilot generation background job failed',
            source: 'AutopilotWorker',
            path: `job:${job.id}`,
            stack: error instanceof Error ? error.stack : undefined,
          });

          throw error; // Re-throw to let BullMQ handle retries
        }
      },
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: QUEUE_CONFIG.AUTOPILOT.concurrency,
        limiter: QUEUE_CONFIG.AUTOPILOT.limiter,
      }
    );

    this.setupListeners();
  }

  private setupListeners() {
    this.worker.on('completed', (job) => {
      console.log(`[AutopilotWorker] Job ${job.id} has completed!`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[AutopilotWorker] Job ${job?.id} has failed with ${err.message}`);
    });

    this.worker.on('error', (err) => {
      console.error('[AutopilotWorker] Worker error:', err);
    });
  }

  public async close() {
    await this.worker.close();
  }
}
