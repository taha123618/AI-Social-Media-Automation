import { QueueManager, QUEUE_NAMES } from '../config/queue.config';
import { ContentIntent, Platform } from '@/app/generated/prisma/enums';
import { SchedulingService, SchedulingOptions, ScheduledPost } from './scheduling.service';
import redis from '@/lib/redis';
import prisma from '@/lib/prisma';

export class SchedulerService {
  /**
   * Add an autopilot generation task to the queue
   */
  static async queueAutopilotTask(data: {
    businessId: string;
    creatorId: string;
    days: number;
    postsPerWeek?: number;
    platforms: Platform[];
    contentMix?: any;
  }) {
    const autopilotQueue = QueueManager.getQueue(QUEUE_NAMES.AUTOPILOT);
    return await autopilotQueue.add('generate-autopilot', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }
  /**
   * Add a content generation task to the queue
   */
  static async queueGenerationTask(data: {
    businessId: string;
    creatorId: string;
    intent: ContentIntent;
    platforms: Platform[];
    topic?: string;
    customInstructions?: string;
    draftId?: string;
  }) {
    const generationQueue = QueueManager.getQueue(QUEUE_NAMES.GENERATION);
    return await generationQueue.add('generate-content', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Add a knowledge generation/processing task to the queue
   */
  static async queueKnowledgeTask(data: {
    businessId: string;
    documentId: string;
    content?: string;
  }) {
    const knowledgeQueue = QueueManager.getQueue(QUEUE_NAMES.KNOWLEDGE);
    return await knowledgeQueue.add('process-knowledge', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  /**
   * Schedule a post for publishing
   * Enhanced to create POST table entries with scheduled times
   */
  static async schedulePost(data: {
    draftId: string;
    platform: Platform;
    scheduledTime: Date;
    accessToken?: string;
  }) {
    const delay = data.scheduledTime.getTime() - Date.now();

    if (delay < 0) {
      throw new Error("Scheduled time must be in the future");
    }

    // Get draft details to create POST entries
    const draft = await prisma.contentDraft.findUnique({
      where: { id: data.draftId },
      include: {
        business: {
          include: { socialAccounts: true }
        }
      }
    });

    if (!draft) {
      throw new Error(`Draft ${data.draftId} not found`);
    }

    // Find social account for this platform
    const socialAccount = draft.business.socialAccounts.find(
      account => account.platform === data.platform && account.isActive
    );

    if (!socialAccount) {
      throw new Error(`No active social account found for ${data.platform} platform`);
    }

    // Create POST entry with scheduled time
    const post = await prisma.post.create({
      data: {
        businessId: draft.businessId,
        creatorId: draft.creatorId,
        draftId: data.draftId,
        platform: data.platform,
        scheduledFor: data.scheduledTime,
        socialAccountId: socialAccount.id,
      }
    });

    // Add to Redis scheduling queue
    await SchedulingService.schedulePost(data.draftId, data.scheduledTime);

    // Add to posting queue with delay
    const postingQueue = QueueManager.getQueue(QUEUE_NAMES.POSTING);
    return await postingQueue.add('publish-post', {
      ...data,
      postId: post.id
    }, {
      delay,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }

  /**
   * Process scheduled posts that are ready to be published
   * Enhanced with proper validation and conditional execution
   */
  static async processScheduledPosts(): Promise<void> {
    try {
      // First check if any scheduled posts exist in POST table
      const scheduledPostsCount = await prisma.post.count({
        where: {
          scheduledFor: {
            lte: new Date()
          }
        }
      });

      // If no scheduled posts exist, return early
      if (scheduledPostsCount === 0) {
        console.log('[Scheduler] No scheduled posts found in POST table, skipping execution');
        return;
      }

      // Get scheduled posts from Redis (existing logic)
      const scheduledDrafts = await SchedulingService.getScheduledPosts();

      if (scheduledDrafts.length === 0) {
        console.log('[Scheduler] No scheduled drafts found in Redis');
        return;
      }

      console.log(`[Scheduler] Processing ${scheduledDrafts.length} scheduled drafts...`);

      // Get posts from POST table that are ready to be published
      const readyPosts = await prisma.post.findMany({
        where: {
          scheduledFor: {
            lte: new Date()
          }
        },
        include: {
          draft: {
            include: {
              business: {
                include: { socialAccounts: true },
              },
            },
          },
          socialAccount: true
        }
      });

      if (readyPosts.length === 0) {
        console.log('[Scheduler] No ready posts found in POST table');
        return;
      }

      console.log(`[Scheduler] Found ${readyPosts.length} ready posts to publish`);

      for (const post of readyPosts) {
        try {
          // Validate that the draft still exists and is in proper state
          if (!post.draft || post.draft.status !== 'SCHEDULED') {
            console.warn(`[Scheduler] Invalid draft state for post ${post.id}, skipping`);
            // Update post status to prevent reprocessing
            await prisma.post.update({
              where: { id: post.id },
              data: { scheduledFor: null }
            });
            continue;
          }

          // Add to posting queue for immediate publishing
          const postingQueue = QueueManager.getQueue(QUEUE_NAMES.POSTING);
          await postingQueue.add(
            'post-to-social',
            {
              draftId: post.draftId,
              businessId: post.businessId,
              platform: post.platform,
              socialAccountId: post.socialAccountId,
              postId: post.id // Include post ID for tracking
            },
            {
              delay: 0,
              removeOnComplete: 100,
              removeOnFail: 50,
              attempts: 5,
              backoff: { type: 'exponential', delay: 2000 }
            }
          );

          // Remove from scheduling queue
          await SchedulingService.removeScheduledPost(post.draftId);

          console.log(`[Scheduler] Queued post ${post.id} for publishing`);

        } catch (error) {
          console.error(`[Scheduler] Failed to process post ${post.id}:`, error);
        }
      }

    } catch (error) {
      console.error('[Scheduler] Error processing scheduled posts:', error);
    }
  }

  /**
   * Auto-schedule algorithm: "Smart Spread"
   * Distributes X posts over Y days, intelligently based on platform optimal times
   */
  static async calculateOptimalSchedule(
    businessId: string,
    drafts: Array<{ id: string; platforms: Platform[]; intent: ContentIntent }>,
    options: Partial<SchedulingOptions> = {},
    startDate: Date = new Date(),
    endDate: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  ): Promise<ScheduledPost[]> {
    return await SchedulingService.calculateOptimalSchedule(
      businessId,
      drafts,
      options,
      startDate,
      endDate
    );
  }

  /**
   * Get scheduling queue status
   */
  static async getSchedulingStatus(): Promise<{
    totalScheduled: number;
    nextPostTime: Date | null;
    queueSize: number;
  }> {
    const totalScheduled = await redis.zCard('scheduled-posts');

    const nextPostData = await redis.zRangeWithScores(
      'scheduled-posts',
      0,
      0,
      { REV: true }
    );

    const nextPostTime = nextPostData.length > 0
      ? new Date(nextPostData[0].score)
      : null;

    const postingQueue = QueueManager.getQueue(QUEUE_NAMES.POSTING);
    const queueSize = await postingQueue.getWaitingCount();

    return {
      totalScheduled,
      nextPostTime,
      queueSize,
    };
  }

  /**
   * Get queue statistics for all managed queues
   */
  static async getQueueStats() {
    return await QueueManager.getAllQueueStats();
  }

  /**
   * Close all queues
   */
  static async closeAll() {
    await QueueManager.closeAll();
  }
}
