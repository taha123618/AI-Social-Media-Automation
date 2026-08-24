import { Worker, Job } from 'bullmq';
import { QueueManager, QUEUE_NAMES, REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';
import { VideoService } from '../services/video.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import prisma from '@/lib/prisma';
import { addVideoStatusJob, VideoStatusCheckJob } from '../lib/video-queue';


export { type VideoStatusCheckJob };

export class VideoStatusWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QUEUE_NAMES.VIDEO_STATUS,
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

    this.worker.on('completed', (job) => {
      console.log(`Video status check job ${job.id} completed`);
      SystemLogger.logQueue({
        queueName: 'video-status-check',
        jobId: job.id!,
        status: 'SUCCESS',
        message: `Status check completed for video ${job.data?.jobId}`
      });
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Video status check job ${job?.id} failed:`, err);
      SystemLogger.logQueue({
        queueName: 'video-status-check',
        jobId: job?.id || 'unknown',
        status: 'FAILURE',
        message: `Status check failed: ${err.message}`,
        error: err
      });
    });

    this.worker.on('error', (err) => {
      console.error('Video status worker error:', err);
      SystemLogger.logQueue({
        queueName: 'video-status-check',
        jobId: 'WORKER',
        status: 'FAILURE',
        message: `Worker error: ${err.message}`,
        error: err
      });


      // Log worker errors
      SystemLogger.logActivity({
        action: 'VIDEO_WORKER_ERROR',
        entity: 'VideoGenerationJob',
        details: {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        }
      }).catch(logErr => console.error('Failed to log worker error:', logErr));
    });

    // Log worker startup
    SystemLogger.logActivity({
      action: 'VIDEO_WORKER_STARTED',
      entity: 'VideoGenerationJob',
      details: {
        queueName: 'video-status-check',
        concurrency: 5,
        timestamp: new Date().toISOString()
      }
    }).catch(logErr => console.error('Failed to log worker startup:', logErr));

    // Log queue events for monitoring
    this.worker.on('completed', (job) => {
      console.log(`Video status check job ${job.id} completed`);

      SystemLogger.logActivity({
        action: 'VIDEO_JOB_COMPLETED',
        entity: 'VideoGenerationJob',
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
      console.error(`Video status check job ${job?.id} failed:`, err);

      SystemLogger.logActivity({
        action: 'VIDEO_JOB_FAILED',
        entity: 'VideoGenerationJob',
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

  private async processJob(job: Job<VideoStatusCheckJob>) {
    const { jobId, businessId } = job.data;

    try {
      console.log(`🔍 Processing video status check for job: ${jobId}`);

      // Log system activity - Job processing started
      await SystemLogger.logActivity({
        action: 'VIDEO_STATUS_CHECK_STARTED',
        entity: 'VideoGenerationJob',
        entityId: jobId,
        details: {
          businessId,
          queueJobId: job.id,
          queuePriority: job.opts?.priority,
          queueAttempts: job.attemptsMade + 1
        }
      });

      // Check status with provider
      const status = await VideoService.checkStatus(jobId);

      console.log(`✅ Job ${jobId} status: ${status.status}`);

      // Log queue processing activity
      await SystemLogger.logActivity({
        action: 'VIDEO_STATUS_CHECK_PROCESSED',
        entity: 'VideoGenerationJob',
        entityId: jobId,
        details: {
          businessId,
          previousStatus: 'UNKNOWN',
          newStatus: status.status,
          hasVideoUrl: !!status.videoUrl,
          hasThumbnailUrl: !!status.thumbnailUrl,
          processingTime: Date.now() - job.timestamp,
          queueJobId: job.id
        }
      });

      // Log completion based on status
      if (status.status === 'completed') {
        console.log(`🎉 Video completed: ${jobId}`);
        await SystemLogger.logActivity({
          action: 'VIDEO_GENERATION_COMPLETED',
          entity: 'VideoGenerationJob',
          entityId: jobId,
          details: {
            businessId,
            videoUrl: status.videoUrl,
            thumbnailUrl: status.thumbnailUrl,
            estimatedCompletion: status.estimatedCompletion,
            queueJobId: job.id,
            totalProcessingTime: Date.now() - job.timestamp
          }
        });
      } else if (status.status === 'failed') {
        console.log(`❌ Video failed: ${jobId}`);
        await SystemLogger.logActivity({
          action: 'VIDEO_GENERATION_FAILED',
          entity: 'VideoGenerationJob',
          entityId: jobId,
          details: {
            businessId,
            error: status.error,
            queueJobId: job.id,
            totalProcessingTime: Date.now() - job.timestamp
          }
        });
      } else if (status.status === 'processing' || status.status === 'pending') {
        // Progress logged to console only to reduce DB noise
        console.log(`⏳ Job ${jobId} still in progress (${status.status})...`);

        // PROGRESSIVE POLLING: Re-queue with a much shorter delay for near-real-time updates
        console.log(`⏳ Re-queueing job ${jobId} for check in 250ms...`);
        await addVideoStatusJob({ jobId, businessId }, { delay: 250 });
      }

      return status;
    } catch (error) {
      console.error(`❌ Error processing video status check for job ${jobId}:`, error instanceof Error ? error.message : error);

      // Log error with queue context and store in database
      await SystemLogger.logError({
        message: error instanceof Error ? error.message : 'Unknown error',
        source: 'VideoStatusWorker.processJob',
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
   * Update job status directly in database for error handling
   */
  private async updateJobStatus(jobId: string, status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", error?: string) {
    try {
      await prisma.videoGenerationJob.update({
        where: { id: jobId },
        data: {
          status,
          error: error || null
        }
      });

      console.log(`📝 Updated job ${jobId} status to ${status}${error ? ` with error: ${error}` : ''}`);
    } catch (dbError) {
      console.error('❌ Failed to update job status in database:', dbError instanceof Error ? dbError.message : dbError);

      // Log database error
      await SystemLogger.logError({
        message: dbError instanceof Error ? dbError.message : 'Unknown database error',
        source: 'VideoStatusWorker.updateJobStatus',
        path: `job-${jobId}`,
        stack: dbError instanceof Error ? dbError.stack : undefined,
        context: {
          jobId,
          attemptedStatus: status,
          error: error || null,
          timestamp: new Date().toISOString()
        }
      }).catch(logErr => console.error('Failed to log database error:', logErr));
    }
  }

  /**
   * Add a video status check job to the queue
   */
  async addStatusCheckJob(jobData: VideoStatusCheckJob, options?: { priority?: number; delay?: number; attempts?: number }) {
    await addVideoStatusJob(jobData, options);
    console.log(`📋 Added video status check job ${jobData.jobId} to queue`);

    // Log queue activity
    await SystemLogger.logActivity({
      action: 'VIDEO_JOB_QUEUED',
      entity: 'VideoGenerationJob',
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
    let pendingJobs: Array<{ id: string; businessId: string }> = [];

    try {
      pendingJobs = await VideoService.getPendingJobs();

      if (pendingJobs.length === 0) {
        console.log('📊 No pending video jobs to process');

        // Log queue check activity
        await SystemLogger.logActivity({
          action: 'VIDEO_QUEUE_CHECKED_EMPTY',
          entity: 'VideoGenerationJob',
          details: {
            pendingJobsCount: 0,
            timestamp: new Date().toISOString()
          }
        });

        return;
      }

      console.log(`📋 Adding ${pendingJobs.length} pending video jobs to queue...`);

      // Log bulk queue activity
      await SystemLogger.logActivity({
        action: 'VIDEO_PENDING_JOBS_QUEUED',
        entity: 'VideoGenerationJob',
        details: {
          pendingJobsCount: pendingJobs.length,
          jobIds: pendingJobs.map(job => job.id),
          businessIds: [...new Set(pendingJobs.map(job => job.businessId))],
          timestamp: new Date().toISOString()
        }
      });

      for (const job of pendingJobs) {
        await this.addStatusCheckJob({
          jobId: job.id,
          businessId: job.businessId
        }, {
          priority: 1,
          delay: 0
        });
      }

      console.log(`✅ Added ${pendingJobs.length} jobs to video status check queue`);
    } catch (error) {
      console.error('❌ Error adding pending jobs to queue:', error instanceof Error ? error.message : error);

      // Log queue error to database
      await SystemLogger.logError({
        message: error instanceof Error ? error.message : 'Unknown queue error',
        source: 'VideoStatusWorker.addPendingJobsToQueue',
        path: 'queue-management',
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          pendingJobsCount: pendingJobs.length,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          timestamp: new Date().toISOString()
        }
      });

      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const queue = QueueManager.getQueue(QUEUE_NAMES.VIDEO_STATUS);
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async close() {
    console.log('🛑 Shutting down Video Status Worker...');

    // Log worker shutdown
    await SystemLogger.logActivity({
      action: 'VIDEO_WORKER_SHUTDOWN',
      entity: 'VideoGenerationJob',
      details: {
        queueName: QUEUE_NAMES.VIDEO_STATUS,
        timestamp: new Date().toISOString()
      }
    }).catch(logErr => console.error('Failed to log worker shutdown:', logErr));

    await this.worker.close();

    console.log('✅ Video Status Worker stopped');
  }
}

// Auto-start worker if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new VideoStatusWorker();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Shutting down Video Status Worker...');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM. Shutting down Video Status Worker...');
    await worker.close();
    process.exit(0);
  });

}
