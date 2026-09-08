import { EmbeddingService } from '../embedding.service';

jest.mock('@langchain/openai', () => {
  return {
    OpenAIEmbeddings: jest.fn().mockImplementation((config) => ({
      model: config.model,
      dimensions: config.dimensions,
      embedDocuments: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
      embedQuery: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    })),
  };
});

describe('EmbeddingService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnvironmentInfo', () => {
    it('returns development provider details when NODE_ENV is development', () => {
      (EmbeddingService as any).isDevelopment = true;
      const info = EmbeddingService.getEnvironmentInfo();
      expect(info.environment).toBe('development');
      expect(info.provider).toBe('OpenRouter');
    });

    it('returns production provider details when NODE_ENV is production', () => {
      (EmbeddingService as any).isDevelopment = false;
      const info = EmbeddingService.getEnvironmentInfo();
      expect(info.environment).toBe('production');
      expect(info.provider).toBe('OpenAI');
    });
  });

  describe('embeddings getter', () => {
    it('initializes OpenRouter embeddings in development mode', () => {
      (EmbeddingService as any).isDevelopment = true;
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

      const embeddings = EmbeddingService.embeddings;
      expect(embeddings).toBeDefined();
    });

    it('throws error when OPENROUTER_API_KEY is missing in development', () => {
      (EmbeddingService as any).isDevelopment = true;
      delete process.env.OPENROUTER_API_KEY;

      expect(() => EmbeddingService.embeddings).toThrow('OPENROUTER_API_KEY');
    });

    it('initializes OpenAI embeddings in production mode', () => {
      (EmbeddingService as any).isDevelopment = false;
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const embeddings = EmbeddingService.embeddings;
      expect(embeddings).toBeDefined();
    });

    it('throws error when OPENAI_API_KEY is missing in production', () => {
      (EmbeddingService as any).isDevelopment = false;
      delete process.env.OPENAI_API_KEY;

      expect(() => EmbeddingService.embeddings).toThrow('OPENAI_API_KEY');
    });
  });
});
