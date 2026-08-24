---
name: background-processing
description: Use this skill for designing, implementing, and troubleshooting background jobs, BullMQ queues, workers, and event-driven processing.
---

# Background Processing and Workers

You are operating as a Distributed Systems Engineer responsible for background job orchestration, BullMQ queues, Redis connections, and cron workers.

## Tech Stack
- **Queue Engine**: BullMQ (`bullmq`)
- **Key-Value Store**: Redis (`ioredis` / `redis`)
- **Runner**: Node.js / `tsx` workers
- **Worker Scripts**: `features/*/workers/*.ts` & `scripts/*.ts`

## Worker Matrix

| Worker | Script / Path | Queue Name | Purpose |
| :--- | :--- | :--- | :--- |
| **Scheduler Master** | `scripts/start-scheduler.ts` | Orchestrator | Starts and monitors all BullMQ workers |
| **Posting Worker** | `features/scheduler/workers/posting.worker.ts` | `social-posting-queue` | Dispatches scheduled posts to social APIs |
| **Content Generation** | `features/scheduler/workers/content-generation.worker.ts` | `content-generation-queue` | Generates draft content batches asynchronously |
| **Image Generation** | `features/image_generation/workers/image-generation.worker.ts` | `image-generation-queue` | Generates AI images (Flux/SD) and saves to S3 |
| **Video Status Worker** | `features/video_generation/workers/video-status.worker.ts` | `video-status-queue` | Polls HeyGen/Replicate video rendering status |
| **Knowledge Worker** | `features/scheduler/workers/knowledge.worker.ts` | `knowledge-indexing-queue` | Chunks documents and creates vector embeddings |
| **Email Worker** | `features/scheduler/workers/emailWorker.ts` | `email-notification-queue` | Sends transactional emails & review invites |
| **Social Metrics Sync** | `features/scheduler/workers/social.worker.ts` | `social-sync-queue` | Pulls analytics and comment updates from platforms |
| **AI Blog Worker** | `features/ai-blog/workers/blog-generation.worker.ts` | `blog-generation-queue` | Handles long-form AI blog writing & SEO audits |
| **Ad Campaign Workers** | `features/ad-campaigns/workers/*.ts` | `ad-generation-queue`, `ad-launch-queue` | Handles Meta/Google ad synthesis and publishing |

## Core Patterns

### 1) Queue Definition & Connection
```typescript
import { Queue } from 'bullmq';
import { redisConnection } from '@/lib/redis';

export const postingQueue = new Queue('social-posting-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});
```

### 2) Worker Implementation Pattern
```typescript
import { Worker, Job } from 'bullmq';
import { redisConnection } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { SystemLogger } from '@/lib/logger';

interface PostingJobData {
  postId: string;
  businessId: string;
}

export const postingWorker = new Worker<PostingJobData>(
  'social-posting-queue',
  async (job: Job<PostingJobData>) => {
    const { postId, businessId } = job.data;
    SystemLogger.info(`[PostingWorker] Processing job ${job.id} for post ${postId}`);

    const post = await prisma.post.findUnique({
      where: { id: postId, businessId },
      include: { socialAccount: true },
    });

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    // Publish to platform...
    // Update status in DB
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });

    return { success: true, postId };
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

postingWorker.on('failed', (job, err) => {
  SystemLogger.error(`[PostingWorker] Job ${job?.id} failed: ${err.message}`);
});
```

### 3) Running Workers
Available npm / bun scripts:
```bash
# Start the unified scheduler & workers
bun run workers

# Run individual workers
bun run worker:posting
bun run worker:generation
bun run worker:image
bun run worker:video
bun run worker:blog
bun run worker:ad-generation
```

## Review Checklist
- [ ] Redis connection properly configured via environment variables (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`)
- [ ] Concurrency limits set appropriately to prevent API rate limits
- [ ] Exponential backoff retry configured for network/API failures
- [ ] Prisma queries within workers verify tenant scoping (`businessId`)
- [ ] Errors logged to `JobLog` or `ErrorLog` tables for admin dashboard visibility
