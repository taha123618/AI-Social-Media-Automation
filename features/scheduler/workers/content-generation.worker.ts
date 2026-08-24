import { Worker, Job } from 'bullmq';
import { GenerationService } from '@/features/generation/services/generation.service';
import { ContentIntent, Platform } from '@/app/generated/prisma/client';
import { QueueManager, QUEUE_NAMES, REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import redis from '@/lib/redis';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';


export interface ContentGenerationJob {
  businessId: string;
  creatorId: string;
  intent: ContentIntent;
  platforms: Platform[];
  topic?: string;
  customInstructions?: string;
  scheduleFor?: Date;
  workflowId?: string;
  executionId?: string;
  draftId?: string;
}

export class ContentGenerationWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QUEUE_NAMES.CONTENT_GENERATION,
      this.processJob.bind(this),
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: 5,
        limiter: {
          max: 20,
          duration: 60000, // 1 minute
        },
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`Content generation job ${job.id} completed`);
      SystemLogger.logQueue({
        queueName: QUEUE_NAMES.CONTENT_GENERATION,
        jobId: job.id!,
        status: 'SUCCESS',
        message: `Content generated for business ${job.data?.businessId}`
      });
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Content generation job ${job?.id} failed:`, err);
      SystemLogger.logQueue({
        queueName: QUEUE_NAMES.CONTENT_GENERATION,
        jobId: job?.id || 'unknown',
        status: 'FAILURE',
        message: `Content generation failed: ${err.message}`,
        error: err
      });
    });

    this.worker.on('error', (err) => {
      console.error('Content generation worker error:', err);
      SystemLogger.logQueue({
        queueName: QUEUE_NAMES.CONTENT_GENERATION,
        jobId: 'WORKER',
        status: 'FAILURE',
        message: `Worker error: ${err.message}`,
        error: err
      });
    });

  }

  private async processJob(job: Job<ContentGenerationJob>) {
    const { businessId, creatorId, intent, platforms, topic, customInstructions, scheduleFor } = job.data;

    try {
      // Verify business exists and user has permission
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { members: true },
      });

      if (!business) {
        throw new Error(`Business ${businessId} not found`);
      }

      const hasPermission = business.members.some(
        member => member.userId === creatorId && ['OWNER', 'ADMIN', 'CREATOR'].includes(member.role)
      );

      if (!hasPermission) {
        throw new Error(`User ${creatorId} does not have permission to generate content`);
      }

      // Generate content using the GenerationService
      // If draftId is provided, the service will update that draft instead of creating a new one
      const draft = await GenerationService.generateDraft(
        businessId,
        creatorId,
        {
          intent,
          platforms,
          topic,
          customInstructions,
          workflowId: job.data.workflowId,
          executionId: job.data.executionId,
          draftId: job.data.draftId,
        }
      );

      // If scheduling is requested, update the draft
      if (scheduleFor) {
        await prisma.contentDraft.update({
          where: { id: draft.id },
          data: {
            scheduledFor: scheduleFor,
            status: 'SCHEDULED',
          },
        });

        // Add to scheduling queue
        await this.addToSchedulingQueue(draft.id, scheduleFor);
      }

      return {
        success: true,
        draftId: draft.id,
        status: scheduleFor ? 'SCHEDULED' : 'GENERATED',
      };

    } catch (error) {
      console.error('Content generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log the failure
      await prisma.contentDraft.create({
        data: {
          business: { connect: { id: businessId } },
          creator: creatorId ? { connect: { id: creatorId } } : undefined,
          intent,
          platforms,
          customPrompt: customInstructions,
          status: 'FAILED',
          contextUsed: { error: errorMessage },
        } as any,
      });

      throw error;
    }
  }

  private async addToSchedulingQueue(draftId: string, scheduledFor: Date) {
    await redis.zAdd(
      'scheduled-posts',
      {
        score: scheduledFor.getTime(),
        value: draftId,
      }
    );
  }

  async close() {
    await this.worker.close();
  }
}

// Start worker if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new ContentGenerationWorker();
  console.log('[Worker] Content Generation Worker started successfully');
  process.on('SIGINT', async () => {
    await worker.close();
    process.exit(0);
  });
}
