import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG, QUEUE_NAMES } from '../config/queue.config';
import prisma from '@/lib/prisma';
import { Platform as GeneratedPlatform } from '@/app/generated/prisma/enums';
import { Platform as PrismaPlatform } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';


console.log(`[Worker] Initializing ${QUEUE_NAMES.POSTING} worker...`);

const worker = new Worker(
  QUEUE_NAMES.POSTING,
  async (job: Job) => {
    console.log(`[Job ${job.id}] Publishing post...`, job.data);
    const { draftId, platform, accessToken, postId } = job.data;

    try {
      const draft = await prisma.contentDraft.findUnique({
        where: { id: draftId },
        include: { business: true }
      });

      if (!draft) throw new Error(`Draft ${draftId} not found`);

      await SystemLogger.logActivity({
        action: "SOCIAL_POSTING_STARTED",
        entity: "ContentDraft",
        entityId: draftId,
        userId: draft.creatorId,
        details: { businessId: draft.businessId, platforms: draft.platforms, queueJobId: job.id }
      });

      // Get the specific post record if postId is provided
      let postRecord = null;
      if (postId) {
        postRecord = await prisma.post.findUnique({
          where: { id: postId },
          include: { socialAccount: true }
        });
      }

      // 3. Post to each platform
      for (const platform of draft.platforms) {
        try {
          // Import dynamically
          const importedModule = await import('@/features/social/services/social.service');
          const SocialMediaService = importedModule.SocialMediaService;

          // We cast contentJson to any here because it's stored as Json
          const content = draft.contentJson as any;

          const result = await SocialMediaService.publishInfo(
            draft.businessId,
            platform,
            content?.text || "No content",
            draft.mediaUrl ? [draft.mediaUrl] : []
          );

          console.log(`[Worker] Published to ${platform}:`, result);

          await SystemLogger.logActivity({
            action: "SOCIAL_POST_SUCCESS",
            entity: "Post",
            entityId: result.postId,
            details: { businessId: draft.businessId, platform, platformUrl: result.platformUrl }
          });

          // Create or Update Post Record
          const postData = {
            businessId: draft.businessId,
            creatorId: draft.creatorId,
            draftId: draft.id,
            socialAccountId: result.accountId,
            platform: platform as PrismaPlatform,
            externalPostId: result.postId,
            publishedUrl: result.platformUrl,
            postedAt: new Date(),
            workflowId: draft.workflowId,
            executionId: draft.executionId,
          };

          if (postRecord && postRecord.platform === platform) {
            // Update existing post record
            await prisma.post.update({
              where: { id: postRecord.id },
              data: {
                ...postData,
                scheduledFor: null // Clear scheduled time after posting
              }
            });
          } else {
            // Create new post record
            await prisma.post.create({
              data: postData
            });
          }

        } catch (error: any) {
          console.error(`[Worker] Failed to post to ${platform}`, error);
          await SystemLogger.logError({
            message: error.message || `Failed to post to ${platform}`,
            source: "PostingWorker",
            context: { draftId, platform, businessId: draft.businessId }
          });
        }
      }

      // 4. Update Draft Status
      await prisma.contentDraft.update({
        where: { id: draftId },
        data: {
          status: "POSTED",
          postedAt: new Date()
        },
      });

      console.log(`[Job ${job.id}] Published successfully. Draft ID: ${draftId}`);

      await SystemLogger.logActivity({
        action: "SOCIAL_POSTING_COMPLETED",
        entity: "ContentDraft",
        entityId: draftId,
        details: { businessId: draft.businessId, queueJobId: job.id }
      });

      return { draftId, postId, status: 'SUCCESS' };

    } catch (error: any) {
      console.error(`[Job ${job.id}] Failed:`, error);

      await SystemLogger.logError({
        message: error.message || "Social posting worker failed",
        source: "PostingWorker",
        context: { jobId: job.id, draftId, postId }
      });

      // Update post record to clear scheduled time on failure
      if (postId) {
        try {
          await prisma.post.update({
            where: { id: postId },
            data: { scheduledFor: null }
          });
        } catch (updateError) {
          console.error(`[Worker] Failed to update post record:`, updateError);
        }
      }

      // Log job failure
      try {
        const draft = draftId ? await prisma.contentDraft.findUnique({ where: { id: draftId } }) : null;
        await prisma.jobLog.create({
          data: {
            jobId: job.id || 'unknown',
            queueName: QUEUE_NAMES.POSTING,
            status: 'FAILED',
            businessId: draft?.businessId,
            userId: draft?.creatorId,
            error: error.message
          }
        });
      } catch (e) {
        console.error("Failed to write job log", e);
      }

      throw error;
    }
  },
  {
    connection: REDIS_CONNECTION_CONFIG,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 1000
    }
  }
);

async function mockSocialApiCall(platform: GeneratedPlatform, content: { text: string }, token: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (content.text.includes("FAIL_ME")) {
    throw new Error("Simulated API Error");
  }

  return `social_${platform}_${Date.now()}`;
}

worker.on('completed', async (job) => {
  console.log(`[Job ${job.id}] Completed successfully`);

  SystemLogger.logQueue({
    queueName: QUEUE_NAMES.POSTING,
    jobId: job.id!,
    status: 'SUCCESS',
    message: `Post published for draft ${job.data?.draftId}`
  });

  try {
    const { draftId } = job.data;
    const draft = draftId ? await prisma.contentDraft.findUnique({ where: { id: draftId } }) : null;

    await prisma.jobLog.create({
      data: {
        jobId: job.id || 'unknown',
        queueName: QUEUE_NAMES.POSTING,
        status: 'COMPLETED',
        businessId: draft?.businessId,
        userId: draft?.creatorId,
        result: job.returnvalue
      }
    });
  } catch (e) {
    console.error("Failed to write job log on completion", e);
  }
});

worker.on('failed', (job, err) => {
  console.error(`[Job ${job?.id}] Failed permanently: ${err.message}`);

  SystemLogger.logQueue({
    queueName: QUEUE_NAMES.POSTING,
    jobId: job?.id || 'unknown',
    status: 'FAILURE',
    message: `Post failed: ${err.message}`,
    error: err
  });
});


export default worker;

// Start worker if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[Worker] Social Posting Worker started successfully');
  process.on('SIGINT', async () => {
    await worker.close();
    process.exit(0);
  });
}
