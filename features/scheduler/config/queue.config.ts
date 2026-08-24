import { ConnectionOptions, Queue } from 'bullmq';

export const REDIS_CONNECTION_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

export const QUEUE_NAMES = {
  GENERATION: 'content-generation',
  MEDIA: 'media-synthesis',
  POSTING: 'social-posting',
  SCHEDULING: 'content-scheduling',
  AUTOPILOT: 'autopilot-generation',
  KNOWLEDGE: 'knowledge-generation',
  EMAIL: 'emailQueue',
  WORKFLOW: 'workflow-execution',
  SOCIAL: 'socialQueue',
  ASSET: 'asset-generation',
  ANALYTICS: 'analytics-collection',
  VIDEO_STATUS: 'video-status-check',
  IMAGE_STATUS: 'image-status-check',
  IMAGE_GENERATION: 'image-generation',
  CONTENT_GENERATION: 'content-generation',
} as const;

export const QUEUE_CONFIG = {
  GENERATION: {
    concurrency: 5,
    limiter: {
      max: 20,
      duration: 60000, // 1 minute
    },
  },
  POSTING: {
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 1000, // 1 second for rate limiting
    },
  },
  MEDIA: {
    concurrency: 3,
    limiter: {
      max: 15,
      duration: 60000, // 1 minute
    },
  },
  AUTOPILOT: {
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000,
    },
  },
  KNOWLEDGE: {
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000,
    },
  },
} as const;

export class QueueManager {
  private static queues: Map<string, Queue<any>> = new Map();
  private static initialized = false;

  static initializeQueues() {
    if (this.initialized) return;

    const queueNames = Object.values(QUEUE_NAMES);

    for (const name of queueNames) {
      if (!this.queues.has(name)) {
        const queue = new Queue(name, {
          connection: REDIS_CONNECTION_CONFIG,
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        });
        this.queues.set(name, queue);
      }
    }
    this.initialized = true;
  }

  static getQueue<T = any>(name: string): Queue<T> {
    // Ensure queues are initialized
    if (!this.initialized) {
      this.initializeQueues();
    }

    // Map common aliases to full queue names to prevent accidental wrong queue creation
    const aliasMap: Record<string, string> = {
      'email': QUEUE_NAMES.EMAIL,
      'posting': QUEUE_NAMES.POSTING,
      'scheduling': QUEUE_NAMES.SCHEDULING,
      'generation': QUEUE_NAMES.GENERATION,
      'workflow': QUEUE_NAMES.WORKFLOW,
      'social': QUEUE_NAMES.SOCIAL,
      'asset': QUEUE_NAMES.ASSET,
      'analytics': QUEUE_NAMES.ANALYTICS,
    };

    const targetName = aliasMap[name] || name;

    if (!this.queues.has(targetName)) {
      console.warn(`[QueueManager] Queue '${targetName}' not pre-initialized, creating on-demand`);
      const queue = new Queue(targetName, {
        connection: REDIS_CONNECTION_CONFIG,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });
      this.queues.set(targetName, queue);
    }

    return this.queues.get(targetName) as Queue<T>;
  }

  static async getAllQueueStats() {
    if (!this.initialized) {
      this.initializeQueues();
    }

    const stats: Record<string, any> = {};
    const queueEntries = Array.from(this.queues.entries());

    for (const [name, queue] of queueEntries) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      stats[name] = {
        waiting,
        active,
        completed,
        failed,
        delayed,
      };
    }

    return stats;
  }

  static async closeAll() {
    const promises = Array.from(this.queues.values()).map(queue => queue.close());
    await Promise.all(promises);
    this.queues.clear();
    this.initialized = false;
  }
}
