import { QueueManager, QUEUE_NAMES } from '../features/scheduler/config/queue.config';

export type SocialTaskType = 'generate-content' | 'refine-content' | 'generate-image' | 'publish-post' | 'fetch-analytics';

export interface SocialTaskData {
  type: SocialTaskType;
  businessId: string;
  userId: string;
  input: any;
  postId?: string;
  draftId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Queue (producer) — safe to import from Next.js API routes.
// ─────────────────────────────────────────────────────────────────────────────
export const socialQueue = QueueManager.getQueue<SocialTaskData>(QUEUE_NAMES.SOCIAL);

/**
 * Add a social media task to the queue
 */
export const addSocialTaskToQueue = async (taskData: SocialTaskData) => {
  const job = await socialQueue.add(taskData.type, taskData, {
    priority: taskData.type === 'publish-post' ? 10 : 5,
  });
  console.log(`🚀 Queued social task: ${taskData.type} | Business: ${taskData.businessId} | Job ID: ${job.id}`);
  return job;
};

export default socialQueue;
