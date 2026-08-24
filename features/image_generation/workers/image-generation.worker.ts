import { Worker, Job } from 'bullmq';
import { QueueManager, QUEUE_NAMES, REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import { ImageService } from '../services/image.service';
import { SystemLogger } from '@/features/system/services/logger.service';


export interface ImageGenerationJob {
  jobId: string;
  businessId?: string;
  userId?: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
  model?: string;
  variations?: number;
  referenceImage?: string;
  priority?: number;
  delay?: number;
  attempts?: number;
  brandId?: string;
  colors?: string[];
  imageType?: string;
}

export class ImageGenerationWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QUEUE_NAMES.IMAGE_GENERATION,
      this.processJob.bind(this),
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: 10,
        limiter: {
          max: 50,
          duration: 30000,
        },
      }
    );


    this.worker.on('error', (err) => {
      console.error('Image generation worker error:', err);

      SystemLogger.logQueue({
        queueName: 'image-generation',
        jobId: 'WORKER',
        status: 'FAILURE',
        message: `Worker error: ${err.message}`,
        error: err
      });

      // Log worker errors
      SystemLogger.logActivity({
        action: 'IMAGE_WORKER_ERROR',
        entity: 'ImageGenerationJob',
        details: {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        }
      }).catch((logErr: unknown) => console.error('Failed to log worker error:', logErr));
    });

    // Log worker startup
    SystemLogger.logActivity({
      action: 'IMAGE_WORKER_STARTED',
      entity: 'ImageGenerationJob',
      details: {
        queueName: 'image-generation',
        concurrency: 10,
        timestamp: new Date().toISOString()
      }
    }).catch((logErr: unknown) => console.error('Failed to log worker startup:', logErr));

    // Log queue events for monitoring
    this.worker.on('completed', (job) => {
      console.log(`Image generation job ${job.id} completed`);

      SystemLogger.logQueue({
        queueName: 'image-generation',
        jobId: job.id!,
        status: 'SUCCESS',
        message: `Job completed in ${Date.now() - job.timestamp}ms`
      });

      SystemLogger.logActivity({
        action: 'IMAGE_JOB_COMPLETED',
        entity: 'ImageGenerationJob',
        entityId: job.data?.jobId,
        details: {
          queueJobId: job.id,
          completedAt: new Date().toISOString(),
          processingTime: Date.now() - job.timestamp,
          returnvalue: job.returnvalue
        }
      }).catch((logErr: unknown) => console.error('Failed to log job completion:', logErr));
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Image generation job ${job?.id} failed:`, err);

      SystemLogger.logQueue({
        queueName: 'image-generation',
        jobId: job?.id || 'unknown',
        status: 'FAILURE',
        message: `Job failed: ${err.message}`,
        error: err
      });

      SystemLogger.logActivity({
        action: 'IMAGE_JOB_FAILED',
        entity: 'ImageGenerationJob',
        entityId: job?.data?.jobId,
        details: {
          queueJobId: job?.id,
          failedAt: new Date().toISOString(),
          processingTime: job ? Date.now() - job.timestamp : 0,
          error: err.message,
          stack: err.stack
        }
      }).catch((logErr: unknown) => console.error('Failed to log job failure:', logErr));
    });
  }


  private async processJob(job: Job<ImageGenerationJob>) {
    const {
      jobId,
      businessId,
      userId,
      prompt,
      style,
      aspectRatio,
      quality,
      model,
      variations,
      referenceImage,
      brandId,
      colors,
      imageType
    } = job.data;

    try {
      console.log(`🎨 Processing brand-aware image generation job: ${jobId}`);

      // Log system activity - Job processing started
      await SystemLogger.logActivity({
        action: 'BRAND_AWARE_IMAGE_GENERATION_STARTED',
        entity: 'ImageGenerationJob',
        entityId: jobId,
        details: {
          businessId,
          userId,
          queueJobId: job.id,
          queuePriority: job.opts?.priority,
          queueAttempts: job.attemptsMade + 1,
          promptLength: prompt.length,
          style,
          aspectRatio,
          quality,
          model,
          variations,
          brandId,
          colors: colors || [],
          imageType,
          timestamp: new Date().toISOString()
        }
      });

      // Always use the standard queue-based processing, which correctly handles DB state updates
      // and passes all brand features (brandId, colors, imageType) to the ImageService.
      const result = await ImageService.processQueuedJob(jobId);

      console.log(`✅ Successfully processed brand-aware image generation job: ${jobId}`);
      return result;

    } catch (error) {
      console.error(`❌ Failed to process brand-aware image generation job ${jobId}:`, error);

      // Log error with queue context and store in database
      await SystemLogger.logError({
        message: error instanceof Error ? error.message : 'Unknown error',
        source: 'ImageGenerationWorker.processJob',
        path: `job-${jobId}`,
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          businessId,
          userId,
          queueJobId: job.id,
          queueAttempts: job.attemptsMade + 1,
          prompt: prompt.substring(0, 100) + '...',
          error: error instanceof Error ? error.message : 'Unknown error',
          brandId,
          colors: colors || [],
          imageType,
          timestamp: new Date().toISOString()
        }
      }).catch((logErr: unknown) => console.error('Failed to log error:', logErr));

      // Re-throw error to let BullMQ handle retries
      throw error;
    }
  }

  /**
   * Add an image generation job to the queue
   */
  async addGenerationJob(jobData: ImageGenerationJob, options?: { priority?: number; delay?: number; attempts?: number }) {
    const queue = QueueManager.getQueue(QUEUE_NAMES.IMAGE_GENERATION);
    await queue.add('generate-image', jobData, options);
    console.log(`📋 Added image generation job ${jobData.jobId} to queue`);

    // Log queue activity
    await SystemLogger.logActivity({
      action: 'IMAGE_JOB_QUEUED',
      entity: 'ImageGenerationJob',
      entityId: jobData.jobId,
      details: {
        businessId: jobData.businessId,
        userId: jobData.userId,
        queuePriority: options?.priority,
        queueDelay: options?.delay,
        queueOptions: options,
        promptLength: jobData.prompt.length,
        style: jobData.style,
        model: jobData.model
      }
    });
  }

  /**
   * Add multiple pending jobs to the queue
   */
  async addPendingJobsToQueue() {
    let pendingJobs: any[] = [];

    try {
      // Import ImageService to get pending jobs
      pendingJobs = await ImageService.getPendingJobs();

      if (pendingJobs.length === 0) {
        console.log('📊 No pending image jobs to process');

        // Log queue check activity
        await SystemLogger.logActivity({
          action: 'IMAGE_QUEUE_CHECKED_EMPTY',
          entity: 'ImageGenerationJob',
          details: {
            pendingJobsCount: 0,
            timestamp: new Date().toISOString()
          }
        });

        return;
      }

      console.log(`📋 Adding ${pendingJobs.length} pending image jobs to queue...`);

      // Log bulk queue activity
      await SystemLogger.logActivity({
        action: 'IMAGE_PENDING_JOBS_QUEUED',
        entity: 'ImageGenerationJob',
        details: {
          pendingJobsCount: pendingJobs.length,
          jobIds: pendingJobs.map(job => job.id),
          businessIds: [...new Set(pendingJobs.map(job => job.businessId).filter(Boolean))],
          timestamp: new Date().toISOString()
        }
      });

      for (const job of pendingJobs) {
        await this.addGenerationJob({
          jobId: job.id,
          businessId: job.businessId,
          userId: job.userId,
          prompt: job.prompt,
          style: job.style || 'realistic',
          aspectRatio: job.aspectRatio || '1:1',
          quality: job.quality || 'standard',
          model: job.model || 'dall-e-3',
          variations: job.variations || 1,
          brandId: job.brandId,
          colors: job.colors,
          imageType: job.imageType
        }, {
          priority: 1,
          delay: 0
        });
      }

      console.log(`✅ Successfully queued ${pendingJobs.length} image jobs`);

    } catch (error) {
      console.error('❌ Failed to add pending image jobs to queue:', error);

      // Log queue error to database
      await SystemLogger.logError({
        message: error instanceof Error ? error.message : 'Unknown queue error',
        source: 'ImageGenerationWorker.addPendingJobsToQueue',
        path: 'queue-management',
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          pendingJobsCount: pendingJobs.length,
          timestamp: new Date().toISOString()
        }
      }).catch((logErr: unknown) => console.error('Failed to log queue error:', logErr));
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const queue = QueueManager.getQueue(QUEUE_NAMES.IMAGE_GENERATION);
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  }

  /**
   * Close the worker and queue connections
   */
  async close() {
    console.log('🛑 Closing Image Generation Worker...');
    await this.worker.close();
    console.log('✅ Image Generation Worker closed');
  }
}
