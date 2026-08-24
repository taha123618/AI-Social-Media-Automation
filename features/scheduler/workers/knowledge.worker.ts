import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG, QUEUE_NAMES, QUEUE_CONFIG } from '../config/queue.config';
import { VectorService } from '@/features/knowledge/services/vector.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

export class KnowledgeWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      QUEUE_NAMES.KNOWLEDGE,
      async (job: Job) => {
        const { businessId, documentId, content } = job.data;

        console.log(`[KnowledgeWorker] Processing job ${job.id} for document ${documentId}`);

        try {
          // 1. Process the document (Vectorization)
          // VectorService.processDocument handles splitting and embedding
          await VectorService.processDocument(documentId, content);

          // 2. Update status to ACTIVE
          await prisma.knowledgeDocument.update({
            where: { id: documentId },
            data: { status: 'ACTIVE' }
          });

          await SystemLogger.logActivity({
            action: 'KNOWLEDGE_DOCUMENT_PROCESSED',
            entity: 'KnowledgeDocument',
            details: {
              businessId,
              documentId,
              jobId: job.id
            },
          });

          console.log(`[KnowledgeWorker] Successfully processed document ${documentId}`);

          return { success: true, documentId };
        } catch (error) {
          console.error(`[KnowledgeWorker] Job ${job.id} failed:`, error);

          await prisma.knowledgeDocument.update({
            where: { id: documentId },
            data: { status: 'ERROR' }
          });

          await SystemLogger.logError({
            message: error instanceof Error ? error.message : 'Knowledge processing failed',
            source: 'KnowledgeWorker',
            path: `job:${job.id}`,
            stack: error instanceof Error ? error.stack : undefined,
          });

          throw error;
        }
      },
      {
        connection: REDIS_CONNECTION_CONFIG,
        concurrency: QUEUE_CONFIG.KNOWLEDGE.concurrency,
        limiter: QUEUE_CONFIG.KNOWLEDGE.limiter,
      }
    );

    this.setupListeners();
  }

  private setupListeners() {
    this.worker.on('completed', (job) => {
      console.log(`[KnowledgeWorker] Job ${job.id} has completed!`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[KnowledgeWorker] Job ${job?.id} has failed with ${err.message}`);
    });
  }

  public async close() {
    await this.worker.close();
  }
}

// Start worker if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new KnowledgeWorker();
  console.log('[KnowledgeWorker] Knowledge Generation Worker started successfully');
  process.on('SIGINT', async () => {
    await worker.close();
    process.exit(0);
  });
}
