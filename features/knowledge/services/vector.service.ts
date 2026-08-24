import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import prisma from "@/lib/prisma";
import pRetry from "p-retry";
import { z } from "zod";
import { EmbeddingService } from "@/services/ai/embedding.service";
import { SystemLogger } from "@/features/system/services/logger.service";

// Zod schemas for validation
const ChunkSchema = z.object({
  content: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const SimilarityResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  documentId: z.string(),
  metadata: z.any(),
  similarity: z.number(),
});

export type Chunk = z.infer<typeof ChunkSchema>;
export type SimilarityResult = z.infer<typeof SimilarityResultSchema>;

export class VectorService {
  public static isMock = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your-openai-api-key-here");

  // Use the dynamic embedding service
  public static get embeddings() {
    return EmbeddingService.embeddings;
  }

  /**
   * Chunk text content into smaller pieces for embedding
   */
  static async chunkText(content: string, chunkSize: number = 1000, overlap: number = 200): Promise<Chunk[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: overlap,
    });

    // For simplicity, we'll treat the entire content as one document
    const documents = [{ pageContent: content, metadata: {} }];
    const splits = await splitter.splitDocuments(documents);

    return splits.map((split: { pageContent: string; metadata: Record<string, unknown> }) =>
      ChunkSchema.parse({
        content: split.pageContent,
        metadata: split.metadata
      })
    );
  }

  /**
   * Generate embeddings for an array of texts
   */
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (VectorService.isMock) {
      console.warn("Using MOCK embeddings. Set OPENAI_API_KEY for production.");
      return texts.map(() => Array.from({ length: 1536 }, () => Math.random()));
    }

    try {
      return await VectorService.embeddings.embedDocuments(texts);
    } catch (error: any) {
      console.error("Failed to generate embeddings:", error);
      await SystemLogger.logError({
        message: error.message || "Failed to generate embeddings",
        source: "VectorService.generateEmbeddings",
        context: { count: texts.length }
      });
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store chunks with their embeddings in the database
   */
  static async storeChunks(
    documentId: string,
    chunks: Chunk[],
    knowledgeBaseId: string
  ): Promise<number> {
    if (chunks.length === 0) {
      return 0;
    }

    // Generate embeddings for all chunks
    const embeddings = await VectorService.generateEmbeddings(
      chunks.map(chunk => chunk.content)
    );

    const batchSize = 10;
    let totalProcessed = 0;

    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchEmbeddings = embeddings.slice(i, i + batchSize);

      try {
        await pRetry(async () => {
          await prisma.$transaction(async (tx) => {
            for (let j = 0; j < batch.length; j++) {
              const chunk = batch[j];
              const embedding = batchEmbeddings[j];

              // Convert embedding array to PostgreSQL vector format
              const vectorString = `[${embedding.join(",")}]`;
              const metadataJson = JSON.stringify(chunk.metadata || {});

              await tx.$executeRaw`
                INSERT INTO "KnowledgeChunk"
                ("id", "content", "documentId", "knowledgeBaseId", "embedding", "metadata")
                VALUES (
                  gen_random_uuid(),
                  ${chunk.content},
                  ${documentId},
                  ${knowledgeBaseId},
                  ${vectorString}::vector,
                  ${metadataJson}
                )
                ON CONFLICT (id) DO NOTHING;
              `;
            }
          }, {
            timeout: 15000 // 15 seconds timeout for batch operations
          });

          console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${batch.length} chunks`);
          totalProcessed += batch.length;
        }, {
          retries: 3,
          minTimeout: 1000,
          onFailedAttempt: (error) => {
            const attemptNumber = (error as { attemptNumber?: number }).attemptNumber || 'unknown';
            const errorMessage = (error as { message?: string }).message || 'Unknown error';
            console.warn(`Batch ${Math.floor(i / batchSize) + 1} failed (attempt ${attemptNumber}):`, errorMessage);
          }
        });
      } catch (error: any) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed permanently:`, error);
        await SystemLogger.logError({
          message: error.message || "Batch storage failed permanently",
          source: "VectorService.storeChunks",
          context: { documentId, batchIndex: Math.floor(i / batchSize), batchSize: batch.length }
        });
        throw error;
      }
    }

    return totalProcessed;
  }

  /**
   * Perform similarity search using pgvector
   */
  static async similaritySearch(
    businessId: string,
    query: string,
    limit: number = 5,
    minSimilarity: number = 0.7
  ): Promise<SimilarityResult[]> {
    // Generate embedding for the query
    let queryEmbedding: number[];
    if (VectorService.isMock) {
      queryEmbedding = Array.from({ length: 1536 }, () => Math.random());
    } else {
      queryEmbedding = await VectorService.embeddings.embedQuery(query);
    }

    const vectorQuery = `[${queryEmbedding.join(",")}]`;

    try {
      const results = await prisma.$queryRaw`
        SELECT
          kc."id",
          kc."content",
          kc."documentId",
          kc."metadata",
          1 - (kc."embedding" <=> ${vectorQuery}::vector) as similarity
        FROM "KnowledgeChunk" kc
        JOIN "KnowledgeDocument" kd ON kc."documentId" = kd."id"
        JOIN "KnowledgeBase" kb ON kd."knowledgeBaseId" = kb."id"
        WHERE kb."businessId" = ${businessId}
          AND (1 - (kc."embedding" <=> ${vectorQuery}::vector)) >= ${minSimilarity}
        ORDER BY similarity DESC
        LIMIT ${limit};
      `;

      // Validate and type the results
      const validatedResults = (results as Array<{id: string; content: string; documentId: string; metadata: unknown; similarity: string}>).map(row =>
        SimilarityResultSchema.parse({
          id: row.id,
          content: row.content,
          documentId: row.documentId,
          metadata: row.metadata,
          similarity: parseFloat(row.similarity)
        })
      );

      await SystemLogger.logActivity({
        action: "VECTOR_SEARCH_COMPLETED",
        entity: "KnowledgeBase",
        details: { businessId, query, resultsCount: validatedResults.length }
      });

      return validatedResults;
    } catch (error: any) {
      console.error("Similarity search failed:", error);
      await SystemLogger.logError({
        message: error.message || "Similarity search failed",
        source: "VectorService.similaritySearch",
        context: { businessId, query }
      });
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process a document: chunk, embed, and store
   */
  static async processDocument(
    documentId: string,
    textContent: string,
    chunkSize: number = 1000,
    overlap: number = 200
  ): Promise<number> {
    // Get the knowledge base ID
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id: documentId },
      select: { knowledgeBaseId: true, filename: true }
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    await SystemLogger.logActivity({
      action: "DOCUMENT_PROCESSING_STARTED",
      entity: "KnowledgeDocument",
      entityId: documentId,
      details: { filename: document.filename, knowledgeBaseId: document.knowledgeBaseId }
    });

    console.log(`Processing document ${documentId} (${document.filename}) for KB ${document.knowledgeBaseId}`);

    // 1. Chunk the text
    const chunks = await VectorService.chunkText(textContent, chunkSize, overlap);
    console.log(`Split into ${chunks.length} chunks`);

    // 2. Store chunks with embeddings
    const processedCount = await VectorService.storeChunks(
      documentId,
      chunks,
      document.knowledgeBaseId
    );

    console.log(`Successfully processed ${processedCount} chunks for document ${documentId}`);

    await SystemLogger.logActivity({
      action: "DOCUMENT_PROCESSING_COMPLETED",
      entity: "KnowledgeDocument",
      entityId: documentId,
      details: { processedCount }
    });

    return processedCount;
  }

  /**
   * Delete all chunks for a document (cleanup)
   */
  static async deleteDocumentChunks(documentId: string): Promise<number> {
    try {
      const deleted = await prisma.knowledgeChunk.deleteMany({
        where: { documentId }
      });

      console.log(`Deleted ${deleted.count} chunks for document ${documentId}`);
      return deleted.count;
    } catch (error) {
      console.error(`Failed to delete chunks for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics about the knowledge base
   */
  static async getKnowledgeStats(businessId: string): Promise<{
    totalChunks: number;
    totalDocuments: number;
    averageChunkLength: number;
  }> {
    try {
      const [chunkStats, docCount] = await Promise.all([
        prisma.$queryRaw`
          SELECT
            COUNT(*) as total_chunks,
            AVG(LENGTH("content")) as avg_length
          FROM "KnowledgeChunk" kc
          JOIN "KnowledgeDocument" kd ON kc."documentId" = kd."id"
          JOIN "KnowledgeBase" kb ON kd."knowledgeBaseId" = kb."id"
          WHERE kb."businessId" = ${businessId}
        `,
        prisma.knowledgeDocument.count({
          where: {
            knowledgeBase: {
              businessId
            }
          }
        })
      ]);

      const stats = (chunkStats as Array<{ total_chunks: bigint; avg_length: number }>)[0];

      return {
        totalChunks: Number(stats.total_chunks),
        totalDocuments: docCount,
        averageChunkLength: Math.round(stats.avg_length || 0)
      };
    } catch (error) {
      console.error("Failed to get knowledge stats:", error);
      throw error;
    }
  }
}