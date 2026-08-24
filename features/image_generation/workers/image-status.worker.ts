import { Worker, Job } from 'bullmq';
import { QueueManager, QUEUE_NAMES, REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import { ImageService } from '../services/image.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import prisma from '@/lib/prisma';
import { addImageStatusJob, ImageStatusCheckJob } from '../lib/image-queue';

export { type ImageStatusCheckJob };

export class ImageStatusWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QUEUE_NAMES.IMAGE_STATUS,
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
      console.error('Image status worker error:', err);
      SystemLogger.logQueue({
        queueName: 'image-status-check',
        jobId: 'WORKER',
        status: 'FAILURE',
        message: `Worker error: ${err.message}`,
        error: err
      });

      // Log worker errors
      SystemLogger.logActivity({
        action: 'IMAGE_STATUS_WORKER_ERROR',
        entity: 'ImageGenerationJob',
        details: {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        }
      }).catch(logErr => console.error('Failed to log worker error:', logErr));
    });

    // Log worker startup
    SystemLogger.logActivity({
      action: 'IMAGE_STATUS_WORKER_STARTED',
      entity: 'ImageGenerationJob',
      details: {
        queueName: 'image-status-check',
        concurrency: 10,
        timestamp: new Date().toISOString()
      }
    }).catch(logErr => console.error('Failed to log worker startup:', logErr));

    // Log queue events for monitoring
    this.worker.on('completed', (job) => {
      console.log(`Image status check job ${job.id} completed`);
      SystemLogger.logQueue({
        queueName: 'image-status-check',
        jobId: job.id!,
        status: 'SUCCESS',
        message: `Status check completed for image ${job.data?.jobId}`
      });

      SystemLogger.logActivity({
        action: 'IMAGE_STATUS_JOB_COMPLETED',
        entity: 'ImageGenerationJob',
        entityId: job.data?.jobId,
        details: {
          queueJobId: job.id,
          completedAt: new Date().toISOString(),
          processingTime: Date.now() - job.timestamp,
          returnvalue: job.returnvalue
        }
      }).catch(logErr => console.error('Failed to log job completion:', logErr));
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Image status check job ${job?.id} failed:`, err);
      SystemLogger.logQueue({
        queueName: 'image-status-check',
        jobId: job?.id || 'unknown',
        status: 'FAILURE',
        message: `Status check failed: ${err.message}`,
        error: err
      });

      SystemLogger.logActivity({
        action: 'IMAGE_STATUS_JOB_FAILED',
        entity: 'ImageGenerationJob',
        entityId: job?.data?.jobId,
        details: {
          queueJobId: job?.id,
          failedAt: new Date().toISOString(),
          error: err.message,
          attemptsMade: job?.attemptsMade,
          processingTime: job ? Date.now() - job.timestamp : 0
        }
      }).catch(logErr => console.error('Failed to log job failure:', logErr));
    });
  }

  private async processJob(job: Job<ImageStatusCheckJob>) {
    const { jobId, businessId } = job.data;

    try {
      console.log(`🔍 Processing image status check for job: ${jobId}`);

      // Log system activity - Job processing started
      await SystemLogger.logActivity({
        action: 'IMAGE_STATUS_CHECK_STARTED',
        entity: 'ImageGenerationJob',
        entityId: jobId,
        details: {
          businessId,
          queueJobId: job.id,
          queuePriority: job.opts?.priority,
          queueAttempts: job.attemptsMade + 1
        }
      });

      // Check status with provider
      const status = await ImageService.checkJobStatus(jobId);

      console.log(`✅ Job ${jobId} status: ${status.status}`);

      // Log queue processing activity
      await SystemLogger.logActivity({
        action: 'IMAGE_STATUS_CHECK_PROCESSED',
        entity: 'ImageGenerationJob',
        entityId: jobId,
        details: {
          businessId,
          previousStatus: 'UNKNOWN',
          newStatus: status.status,
          hasImageUrl: !!status.imageUrl,
          processingTime: Date.now() - job.timestamp,
          queueJobId: job.id
        }
      });

      // Log completion based on status
      if (status.status === 'completed') {
        console.log(`🎉 Image completed: ${jobId}`);
        await SystemLogger.logActivity({
          action: 'IMAGE_GENERATION_COMPLETED',
          entity: 'ImageGenerationJob',
          entityId: jobId,
          details: {
            businessId,
            imageUrl: status.imageUrl,
            queueJobId: job.id,
            totalProcessingTime: Date.now() - job.timestamp
          }
        });
      } else if (status.status === 'failed') {
        console.log(`❌ Image failed: ${jobId}`);
        await SystemLogger.logActivity({
          action: 'IMAGE_GENERATION_FAILED',
          entity: 'ImageGenerationJob',
          entityId: jobId,
          details: {
            businessId,
            queueJobId: job.id,
            totalProcessingTime: Date.now() - job.timestamp
          }
        });
      } else if (status.status === 'processing' || status.status === 'pending') {
        // Progress logged to console only to reduce DB noise
        console.log(`⏳ Job ${jobId} still in progress (${status.status})...`);

        // PROGRESSIVE POLLING: Re-queue with a much shorter delay for near-real-time updates
        console.log(`⏳ Re-queueing job ${jobId} for check in 250ms...`);
        await addImageStatusJob({ jobId, businessId }, { delay: 250 });
      }

      return status;
    } catch (error) {
      console.error(`❌ Error processing image status check for job ${jobId}:`, error instanceof Error ? error.message : error);

      // Log error with queue context and store in database
      await SystemLogger.logError({
        message: error instanceof Error ? error.message : 'Unknown error',
        source: 'ImageStatusWorker.processJob',
        path: `job-${jobId}`,
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          jobId,
          businessId,
          queueJobId: job.id,
          queueAttempts: job.attemptsMade + 1,
          processingTime: Date.now() - job.timestamp,
          willRetry: job.attemptsMade < (job.opts?.attempts || 3),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          timestamp: new Date().toISOString()
        }
      });

      throw error;
    }
  }

  /**
   * Add an image status check job to the queue
   */
  async addStatusCheckJob(jobData: ImageStatusCheckJob, options?: { priority?: number; delay?: number; attempts?: number }) {
    await addImageStatusJob(jobData, options);
    console.log(`📋 Added image status check job ${jobData.jobId} to queue`);

    // Log queue activity
    await SystemLogger.logActivity({
      action: 'IMAGE_STATUS_JOB_QUEUED',
      entity: 'ImageGenerationJob',
      entityId: jobData.jobId,
      details: {
        businessId: jobData.businessId,
        queuePriority: options?.priority,
        queueDelay: options?.delay,
        queueOptions: options
      }
    });
  }

  /**
   * Add multiple pending jobs to the queue
   */
  async addPendingJobsToQueue() {
    let pendingJobs: Array<{ id: string; businessId: string | null }> = [];

    try {
      pendingJobs = await prisma.imageGenerationJob.findMany({
        where: {
          status: {
            in: ['PENDING', 'PROCESSING']
          }
        },
        select: {
          id: true,
          businessId: true
        }
      });

      if (pendingJobs.length === 0) {
        return;
      }

      console.log(`📋 Adding ${pendingJobs.length} pending image jobs to status queue...`);

      for (const job of pendingJobs) {
        await addImageStatusJob({
          jobId: job.id,
          businessId: job.businessId || undefined
        }, {
          priority: 1,
          delay: 0
        });
      }

    } catch (error) {
      console.error('❌ Error adding pending image status jobs to queue:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async close() {
    console.log('🛑 Shutting down Image Status Worker...');
    await this.worker.close();
    console.log('✅ Image Status Worker stopped');
  }
}

// Auto-start worker if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new ImageStatusWorker();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Shutting down Image Status Worker...');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM. Shutting down Image Status Worker...');
    await worker.close();
    process.exit(0);
  });
}
