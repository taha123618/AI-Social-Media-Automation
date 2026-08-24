import { Worker, Job } from "bullmq";
import { REDIS_CONNECTION_CONFIG } from "@/features/scheduler/config/queue.config";
import { AD_GENERATION_QUEUE_NAME } from "../lib/ad-queue";
import prisma from "@/lib/prisma";
import { AiCopyService, CampaignBrief } from "../services/ai-copy.service";
import { SystemLogger } from "@/features/system/services/logger.service";

export class AdGenerationWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      AD_GENERATION_QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: 2,
      }
    );

    this.worker.on("completed", (job) => {
      console.log(`[AdWorker] Job ${job.id} completed successfully`);
      SystemLogger.logQueue({
        queueName: AD_GENERATION_QUEUE_NAME,
        jobId: job.id!,
        status: "SUCCESS",
        message: `Ad variants generated for ad ${job.data?.adId}.`,
      });
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[AdWorker] Job ${job?.id} failed:`, err);
      SystemLogger.logQueue({
        queueName: AD_GENERATION_QUEUE_NAME,
        jobId: job?.id || "unknown",
        status: "FAILURE",
        message: `Ad variant generation failed: ${err.message}`,
        error: err,
      });
    });
  }

  private async processJob(job: Job) {
    const { adId, brief, businessId } = job.data as { adId: string, brief: CampaignBrief, businessId: string };

    try {
      console.log(`[AdWorker] Running generation for ad ${adId}...`);

      // Mark ad as pending review initially (or some loading state if added to schema)
      await prisma.ad.update({
        where: { id: adId },
        data: { status: "DRAFT" }, 
      });

      // Generate content
      const variants = await AiCopyService.generateVariants(brief);

      const variantRecords = [];

      // Create Meta Ads variants
      for (const variant of variants.metaAds) {
        variantRecords.push({
          adId,
          headline: variant.headline,
          primaryText: variant.primaryText,
          cta: variant.cta
        });
      }

      // Create Google Ads variants
      for (const variant of variants.googleAds) {
        variantRecords.push({
          adId,
          headline: variant.headline,
          description: variant.description
        });
      }

      // Save variants
      await prisma.adVariant.createMany({
        data: variantRecords
      });

      // Update Ad status
      await prisma.ad.update({
        where: { id: adId },
        data: { status: "PENDING_REVIEW" },
      });

      return { success: true, adId };
    } catch (error: any) {
      console.error(`[AdWorker] Error processing ad ${adId}:`, error);

      // Fallback draft state update on error
      await prisma.ad.update({
        where: { id: adId },
        data: { status: "DRAFT" },
      });

      throw error;
    }
  }

  async close() {
    await this.worker.close();
  }
}

// Start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new AdGenerationWorker();
  console.log("[Worker] Ad Content Generation Worker started successfully");
  process.on("SIGINT", async () => {
    await worker.close();
    process.exit(0);
  });
}
