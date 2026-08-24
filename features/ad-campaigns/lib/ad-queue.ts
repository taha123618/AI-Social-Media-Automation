import { Queue } from "bullmq";
import { REDIS_CONNECTION_CONFIG } from "@/features/scheduler/config/queue.config";

export const AD_GENERATION_QUEUE_NAME = "ad-generation-queue";

export const adGenerationQueue = new Queue(AD_GENERATION_QUEUE_NAME, {
  connection: REDIS_CONNECTION_CONFIG,
});
