import { Worker, Job } from "bullmq";
import { REDIS_CONNECTION_CONFIG } from "@/features/scheduler/config/queue.config";
import { BLOG_QUEUE_NAME } from "../lib/blog-queue";
import prisma from "@/lib/prisma";
import { BlogGeneratorService } from "../services/blog-generator.service";
import { BlogSEOService } from "../services/blog-seo.service";
import { SystemLogger } from "@/features/system/services/logger.service";

export class BlogGenerationWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      BLOG_QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: 2,
      }
    );

    this.worker.on("completed", (job) => {
      console.log(`[BlogWorker] Job ${job.id} completed successfully`);
      SystemLogger.logQueue({
        queueName: BLOG_QUEUE_NAME,
        jobId: job.id!,
        status: "SUCCESS",
        message: `Blog article ${job.data?.articleId} generated successfully.`,
      });
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[BlogWorker] Job ${job?.id} failed:`, err);
      SystemLogger.logQueue({
        queueName: BLOG_QUEUE_NAME,
        jobId: job?.id || "unknown",
        status: "FAILURE",
        message: `Blog generation failed: ${err.message}`,
        error: err,
      });
    });
  }

  private async processJob(job: Job) {
    const { articleId, businessId, outline, options } = job.data;

    try {
      console.log(`[BlogWorker] Running generation for article ${articleId}...`);

      // 1. Mark article as generating
      await prisma.blogArticle.update({
        where: { id: articleId },
        data: { status: "GENERATING" },
      });

      // 2. Generate content
      const htmlContent = await BlogGeneratorService.generateArticle(outline, options);

      // 3. SEO Audit Analysis
      const seoReport = BlogSEOService.analyze(
        options.topic,
        htmlContent,
        outline.metaDescription || "",
        options.targetKeywords
      );

      const wordCount = htmlContent.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 250));

      // 4. Save and change status
      await prisma.$transaction([
        prisma.blogArticle.update({
          where: { id: articleId },
          data: {
            content: htmlContent,
            wordCount,
            readingTime,
            seoScore: seoReport.overallScore,
            status: "REVIEW",
          },
        }),
        prisma.blogSEOReport.create({
          data: {
            articleId,
            overallScore: seoReport.overallScore,
            titleScore: seoReport.titleScore,
            metaDescriptionScore: seoReport.metaDescriptionScore,
            headingStructureScore: seoReport.headingStructureScore,
            keywordDensityScore: seoReport.keywordDensityScore,
            readabilityScore: seoReport.readabilityScore,
            contentLengthScore: seoReport.contentLengthScore,
            internalLinkScore: seoReport.internalLinkScore,
            imageOptScore: seoReport.imageOptScore,
            issues: seoReport.issues as any,
            suggestions: seoReport.suggestions as any,
            serpPreview: seoReport.serpPreview as any,
          },
        }),
        prisma.blogGenerationLog.create({
          data: {
            articleId,
            businessId,
            action: "GENERATE_ARTICLE",
            inputPrompt: JSON.stringify(outline),
            outputPreview: htmlContent.substring(0, 500),
            model: "gemini-2.0-flash-lite",
            status: "COMPLETED",
          },
        }),
      ]);

      return { success: true, articleId };
    } catch (error: any) {
      console.error(`[BlogWorker] Error processing article ${articleId}:`, error);

      // Fallback draft state update on error
      await prisma.blogArticle.update({
        where: { id: articleId },
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
  const worker = new BlogGenerationWorker();
  console.log("[Worker] Blog Content Generation Worker started successfully");
  process.on("SIGINT", async () => {
    await worker.close();
    process.exit(0);
  });
}
