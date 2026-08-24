import { Worker, Job } from 'bullmq';
import { GeneratedContent } from '@/features/generation/services/generation.service';
import prisma from '@/lib/prisma';
import { Platform } from '@/app/generated/prisma/client';
import redis from '@/lib/redis';
import { QueueManager, QUEUE_NAMES, REDIS_CONNECTION_CONFIG } from '@/features/scheduler/config/queue.config';



// Queue definitions (get from Manager)
const socialPostingQueue = QueueManager.getQueue(QUEUE_NAMES.POSTING);
const analyticsCollectionQueue = QueueManager.getQueue(QUEUE_NAMES.ANALYTICS);
const assetGenerationQueue = QueueManager.getQueue(QUEUE_NAMES.ASSET);

// Types for our jobs
interface AssetGenerationJob {
  draftId: string;
  businessId: string;
  content: GeneratedContent; // Generated content from ContentGenerator
  platforms: Platform[];
}

interface SocialPostingJob {
  postId: string;
  businessId: string;
  platform: Platform;
  content: GeneratedContent;
  socialAccountId: string;
}

interface AnalyticsCollectionJob {
  businessId: string;
  postId: string;
  platform: Platform;
}

/**
 * Worker for generating AI assets (images/videos)
 */
const assetGenerationWorker = new Worker(
  QUEUE_NAMES.ASSET,
  async (job: Job<AssetGenerationJob>) => {
    const { draftId, businessId, content, platforms } = job.data;

    console.log(`[ASSET GENERATION] Processing draft ${draftId} for business ${businessId}`);

    try {
      // 2. Generate content using the new GenerationService (if not already provided)
      let finalContent = content;
      if (!finalContent) {
        // This is a fallback if the worker is triggered without content
        // In the new architecture, we usually pass the content in
        throw new Error("Content must be provided to asset generation worker");
      }

      // 3. Generate images using DALL-E (using visualPrompt from new schema)
      const imageUrls: string[] = [];
      const visualPrompt = (finalContent as any).visualPrompt || (finalContent as any).visual_prompt;

      if (visualPrompt) {
        console.log(`[ASSET GENERATION] Generating images with prompt: ${visualPrompt.substring(0, 100)}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        imageUrls.push(`https://generated-images.example.com/${draftId}-1.jpg`);
      }

      // 2. Generate videos using Runway/Luma (Phase 2)
      const videoUrls: string[] = [];

      // 3. Apply brand consistency filters
      const brandedAssets = await applyBrandFilters(businessId, [...imageUrls, ...videoUrls]);

      // 4. Update draft with generated assets
      await prisma.contentDraft.update({
        where: { id: draftId },
        data: {
          mediaUrl: brandedAssets.length > 0 ? brandedAssets[0] : null,
          status: 'APPROVED' // Assuming auto-approval for demo
        }
      });

      console.log(`[ASSET GENERATION] Completed for draft ${draftId}. Generated ${brandedAssets.length} assets.`);

      // 5. Queue social posting if auto-scheduled
      const draft = await prisma.contentDraft.findUnique({
        where: { id: draftId },
        include: { business: true }
      });

      if (draft?.scheduledFor && draft.status === 'APPROVED') {
        for (const platform of platforms) {
          const socialAccount = await prisma.socialAccount.findFirst({
            where: {
              businessId,
              platform,
              isActive: true
            }
          });

          if (socialAccount) {
            await socialPostingQueue.add('post-to-social', {
              postId: draftId, // Using draftId as postId for now
              businessId,
              platform,
              content,
              socialAccountId: socialAccount.id
            }, {
              delay: draft.scheduledFor.getTime() - Date.now()
            });
          }
        }
      }

      return { success: true, assets: brandedAssets };
    } catch (error) {
      console.error(`[ASSET GENERATION] Failed for draft ${draftId}:`, error);
      throw error;
    }
  },
  { connection: REDIS_CONNECTION_CONFIG }
);

/**
 * Worker for posting content to social platforms
 */
const socialPostingWorker = new Worker(
  QUEUE_NAMES.POSTING,
  async (job: Job<SocialPostingJob>) => {
    const { postId, businessId, platform, content, socialAccountId } = job.data;

    console.log(`[SOCIAL POSTING] Posting to ${platform} for business ${businessId}`);

    try {
      // 1. Get social account credentials
      const socialAccount = await prisma.socialAccount.findUnique({
        where: { id: socialAccountId }
      });

      if (!socialAccount) {
        throw new Error(`Social account not found: ${socialAccountId}`);
      }

      // 2. Post to social platform (simplified)
      let externalPostId: string | undefined;
      let publishedUrl: string | undefined;

      // In production, this would integrate with Ayrshare or direct APIs
      switch (platform) {
        case Platform.TWITTER:
          // Twitter API integration
          externalPostId = `tweet_${Date.now()}`;
          publishedUrl = `https://twitter.com/user/status/${externalPostId}`;
          break;

        case Platform.LINKEDIN:
          // LinkedIn API integration
          externalPostId = `linkedin_post_${Date.now()}`;
          publishedUrl = `https://linkedin.com/posts/${externalPostId}`;
          break;

        case Platform.INSTAGRAM:
          // Instagram Graph API integration
          externalPostId = `instagram_${Date.now()}`;
          publishedUrl = `https://instagram.com/p/${externalPostId}`;
          break;

        case Platform.FACEBOOK:
          // Facebook Graph API integration
          externalPostId = `facebook_${Date.now()}`;
          publishedUrl = `https://facebook.com/${externalPostId}`;
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // 3. Update the Post record (Post is created upstream during scheduling)
      const existingPost = await prisma.post.findUnique({ where: { id: postId } });
      if (existingPost) {
        await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'POSTED',
            postedAt: new Date(),
            externalPostId: externalPostId,
            publishedUrl: publishedUrl,
            // Metrics are defaulted to 0 in schema, no need to re-initialize pa
            analyticsUpdatedAt: new Date()
          }
        });
      }

      // 5. Queue analytics collection for later
      await analyticsCollectionQueue.add('collect-analytics', {
        businessId,
        postId: postId,
        platform
      }, {
        delay: 24 * 60 * 60 * 1000 // Collect analytics after 24 hours
      });

      console.log(`[SOCIAL POSTING] Successfully posted to ${platform}: ${publishedUrl}`);

      return {
        success: true,
        externalPostId,
        publishedUrl,
        postId: postId
      };
    } catch (error) {
      console.error(`[SOCIAL POSTING] Failed for post ${postId}:`, error);

      // Update post status to failed (update Post record if it exists)
      await prisma.post.update({
        where: { id: postId },
        data: { status: 'FAILED' }
      }).catch(() => {}); // Ignore if post doesn't exist

      throw error;
    }
  },
  { connection: REDIS_CONNECTION_CONFIG }
);

/**
 * Worker for collecting analytics from social platforms
 */
const analyticsCollectionWorker = new Worker(
  QUEUE_NAMES.ANALYTICS,
  async (job: Job<AnalyticsCollectionJob>) => {
    const { businessId, postId, platform } = job.data;

    console.log(`[ANALYTICS] Collecting for post ${postId} on ${platform}`);

    try {
      // 1. Get Post record (now flattened)
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }

      // 2. Collect analytics (simplified — replace with platform API in production)
      const mockAnalytics = {
        likes: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 150),
        impressions: Math.floor(Math.random() * 5000),
        clicks: Math.floor(Math.random() * 300),
        reach: Math.floor(Math.random() * 4500),
        saves: Math.floor(Math.random() * 80),
        videoViews: Math.floor(Math.random() * 500),
        profileVisits: Math.floor(Math.random() * 60),
        websiteClicks: Math.floor(Math.random() * 40),
        bookingClicks: Math.floor(Math.random() * 15),
        phoneClicks: Math.floor(Math.random() * 20),
        messageClicks: Math.floor(Math.random() * 25),
        directionRequests: Math.floor(Math.random() * 10),
        analyticsUpdatedAt: new Date()
      };

      // 3. Update Post record directly
      await prisma.post.update({
        where: { id: post.id },
        data: mockAnalytics
      });

      console.log(`[ANALYTICS] Collected Post metrics for post ${postId}:`, mockAnalytics);

      return { success: true, analytics: mockAnalytics };
    } catch (error) {
      console.error(`[ANALYTICS] Failed for post ${postId}:`, error);
      throw error;
    }
  },
  { connection: REDIS_CONNECTION_CONFIG }
);

/**
 * Apply brand consistency filters to generated assets
 */
async function applyBrandFilters(businessId: string, assetUrls: string[]): Promise<string[]> {
  // Get brand profile for color palette and watermark info
  const profile = await prisma.businessProfile.findUnique({
    where: { businessId }
  });

  if (!profile) {
    return assetUrls; // Return original if no profile
  }

  // In production, this would:
  // 1. Apply brand color grading
  // 2. Add watermark overlay
  // 3. Resize/optimization per platform
  // 4. Quality enhancement

  console.log(`[BRAND FILTERS] Applying filters for business ${businessId}`);

  // For demo, just return the URLs with a "filtered" suffix
  return assetUrls.map(url => `${url}?filtered=true`);
}

// Error handling
assetGenerationWorker.on('failed', (job, err) => {
  console.error(`[ASSET GENERATION] Job ${job?.id} failed:`, err);
});

socialPostingWorker.on('failed', (job, err) => {
  console.error(`[SOCIAL POSTING] Job ${job?.id} failed:`, err);
});

analyticsCollectionWorker.on('failed', (job, err) => {
  console.error(`[ANALYTICS] Job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  await assetGenerationWorker.close();
  await socialPostingWorker.close();
  await analyticsCollectionWorker.close();
  await redis.quit();
  process.exit(0);
});

export {
  assetGenerationQueue,
  socialPostingQueue,
  analyticsCollectionQueue,
  assetGenerationWorker,
  socialPostingWorker,
  analyticsCollectionWorker
};