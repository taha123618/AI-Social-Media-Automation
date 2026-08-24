import { Queue } from "bullmq";
import { REDIS_CONNECTION_CONFIG } from "@/features/scheduler/config/queue.config";

export const BLOG_QUEUE_NAME = "blog-generation";

export const blogQueue = new Queue(BLOG_QUEUE_NAME, {
  connection: REDIS_CONNECTION_CONFIG,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

export async function addBlogGenerationJob(data: {
  articleId: string;
  businessId: string;
  outline: any;
  options: {
    topic: string;
    targetKeywords: string[];
    secondaryKeywords: string[];
    tone: string;
    language: string;
    wordCountTarget: number;
  };
}) {
  return await blogQueue.add("generate-article-job", data);
}
