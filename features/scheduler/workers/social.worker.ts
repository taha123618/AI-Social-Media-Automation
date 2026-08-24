import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG, QUEUE_NAMES } from '../config/queue.config';
import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';
import { ImageService } from '@/features/image_generation/services/image.service';
import { AnalyticsService } from '@/features/social/services/analytics.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import { socialQueue, SocialTaskData } from '@/lib/socialQueue';


/**
 * Social Task Worker
 * Handles heavy AI and Social Media tasks asynchronously
 */
const worker = new Worker<SocialTaskData>(
  QUEUE_NAMES.SOCIAL,
  async (job: Job<SocialTaskData>) => {
    const { type, businessId, userId, input, postId } = job.data;

    try {
      console.log(`[SocialWorker] Processing job ${job.id} | Type: ${type}`);

      switch (type) {
        case 'generate-content': {
          const content = await AIService.generateWithOpenRouter({
            prompt: input.prompt,
            model: input.model,
            maxTokens: 1000,
            temperature: 0.7,
          });

          // Store result in DB for the client to poll
          await prisma.jobLog.create({
            data: {
              jobId: job.id!,
              queueName: QUEUE_NAMES.SOCIAL,
              status: 'completed',
              businessId,
              userId,
              result: { text: content } as any,
            }
          });

          await SystemLogger.logActivity({
            action: 'AI_CONTENT_GENERATED',
            entity: 'ContentDraft',
            userId,
            details: { businessId, type, length: content.length },
          });
          return { success: true, text: content };
        }

        case 'refine-content': {
          const refinementPrompt = `Refine this content: ${input.content}\n\nAction: ${input.refinement}`;
          const content = await AIService.generateWithOpenRouter({
            prompt: refinementPrompt,
            maxTokens: 1500,
            temperature: 0.7,
          });

          await prisma.jobLog.create({
            data: {
              jobId: job.id!,
              queueName: QUEUE_NAMES.SOCIAL,
              status: 'completed',
              businessId,
              userId,
              result: { text: content } as any,
            }
          });

          return { success: true, text: content };
        }

        case 'generate-image': {
          const imageRequest = {
            businessId,
            userId: userId ?? undefined,
            prompt: input.prompt,
            aspectRatio: (input.aspectRatio || (input.size === 'landscape' ? '16:9' : '1:1')) as any,
            style: (input.style || 'realistic') as any,
            quality: (input.quality || 'standard') as any,
            model: (input.model || 'runway-gen4-image') as any,
            variations: input.variations || 1,
            brandId: input.brandId || undefined,
          };
          const result = await ImageService.generateWithRag(imageRequest);

          await prisma.jobLog.create({
            data: {
              jobId: job.id!,
              queueName: QUEUE_NAMES.SOCIAL,
              status: 'completed',
              businessId,
              userId,
              result: result as any,
            }
          });

          return { success: true, ...result };
        }

        case 'fetch-analytics': {
          if (!postId) throw new Error('postId required for fetch-analytics');
          const analytics = await AnalyticsService.updatePostAnalytics(postId, businessId);

          await prisma.jobLog.create({
            data: {
              jobId: job.id!,
              queueName: QUEUE_NAMES.SOCIAL,
              status: 'completed',
              businessId,
              userId,
              result: analytics as any,
            }
          });

          return { success: true, analytics };
        }

        default:
          throw new Error(`Unknown task type: ${type}`);
      }
    } catch (error: unknown) {
      const err = error as Error;

      await prisma.jobLog.create({
        data: {
          jobId: job.id!,
          queueName: QUEUE_NAMES.SOCIAL,
          status: 'failed',
          businessId,
          userId,
          error: err.message,
        }
      });

      await SystemLogger.logError({
        message: `Social task failed: ${err.message}`,
        source: 'SocialWorker',
        context: { jobId: job.id, type, businessId },
      });
      throw err;
    }
  },
  {
    connection: REDIS_CONNECTION_CONFIG,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[SocialWorker] Job ${job.id} completed successfully`);
  SystemLogger.logQueue({
    queueName: QUEUE_NAMES.SOCIAL,
    jobId: job.id!,
    status: 'SUCCESS',
    message: `Social task ${job.data?.type} completed`
  });
});

worker.on('failed', (job, err) => {
  console.error(`[SocialWorker] Job ${job?.id} failed:`, err);
  SystemLogger.logQueue({
    queueName: QUEUE_NAMES.SOCIAL,
    jobId: job?.id || 'unknown',
    status: 'FAILURE',
    message: `Social task failed: ${err.message}`,
    error: err
  });
});


export default worker;
