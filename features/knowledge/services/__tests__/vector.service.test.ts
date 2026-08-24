import { VectorService } from '../vector.service';
import { EmbeddingService } from '@/services/ai/embedding.service';

jest.mock('p-retry', () => ({
  __esModule: true,
  default: jest.fn((fn) => fn()),
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    knowledgeChunk: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
  prisma: {
    knowledgeChunk: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/services/ai/embedding.service', () => ({
  EmbeddingService: {
    embeddings: {
      embedDocuments: jest.fn(),
    },
  },
}));

describe('VectorService', () => {
  describe('chunkText', () => {
    it('splits long content into chunks respecting chunkSize and overlap', async () => {
      const longText = 'Paragraph 1. '.repeat(100) + '\n\n' + 'Paragraph 2. '.repeat(100);
      const chunks = await VectorService.chunkText(longText, 500, 50);

      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(typeof chunk.content).toBe('string');
        expect(chunk.content.length).toBeGreaterThan(0);
      });
    });

    it('handles short text by returning a single chunk', async () => {
      const shortText = 'This is a short brand summary.';
      const chunks = await VectorService.chunkText(shortText, 1000, 200);

      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toBe(shortText);
    });
  });

  describe('generateEmbeddings', () => {
    it('returns an array of numerical embedding vectors for each text input', async () => {
      const mockVector = Array.from({ length: 1536 }, () => 0.05);
      (EmbeddingService.embeddings.embedDocuments as jest.Mock).mockResolvedValue([mockVector, mockVector]);

      const texts = ['First text to embed', 'Second text to embed'];
      const embeddings = await VectorService.generateEmbeddings(texts);

      expect(embeddings.length).toBe(texts.length);
      expect(Array.isArray(embeddings[0])).toBe(true);
      expect(typeof embeddings[0][0]).toBe('number');
    });
  });
});
