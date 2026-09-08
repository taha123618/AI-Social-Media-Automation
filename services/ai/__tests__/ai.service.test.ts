jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    activityLog: { create: jest.fn() },
  },
  prisma: {
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    activityLog: { create: jest.fn() },
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logInfo: jest.fn(),
    logWarn: jest.fn(),
    logError: jest.fn(),
    logActivity: jest.fn(),
  },
}));

const mockInvoke = jest.fn().mockResolvedValue({
  content: 'AI generated test response',
  usage_metadata: {
    input_tokens: 10,
    output_tokens: 20,
    total_tokens: 30,
  },
});

jest.mock('@langchain/openai', () => {
  const ChatOpenAI = jest.fn().mockImplementation(function (this: any) {
    this.invoke = mockInvoke;
  });
  (ChatOpenAI as any).prototype.invoke = mockInvoke;

  const DallEAPIWrapper = jest.fn().mockImplementation(function (this: any) {
    this.invoke = jest.fn().mockResolvedValue('https://example.com/mock-image.png');
  });
  (DallEAPIWrapper as any).prototype.invoke = jest.fn().mockResolvedValue('https://example.com/mock-image.png');

  return {
    ChatOpenAI,
    DallEAPIWrapper,
  };
});

import { AIService } from '../ai.service';

describe('AIService', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockInvoke.mockResolvedValue({
      content: 'AI generated test response',
      usage_metadata: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
      },
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: { content: 'AI generated test response' },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      }),
    } as any);
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  describe('getEnvironmentInfo', () => {
    it('returns environment information for development', () => {
      (AIService as any).isDevelopment = true;
      const info = AIService.getEnvironmentInfo();
      expect(info.environment).toBe('development');
      expect(info.provider).toBe('OpenRouter');
    });

    it('returns environment information for production', () => {
      (AIService as any).isDevelopment = false;
      const info = AIService.getEnvironmentInfo();
      expect(info.environment).toBe('production');
      expect(info.provider).toBe('OpenAI');
    });
  });

  describe('generateResponse', () => {
    it('generates response with given messages in development via OpenRouter', async () => {
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
      (AIService as any).isDevelopment = true;

      const response = await AIService.generateResponse({
        messages: [{ role: 'user', content: 'Hello AI' }],
      });

      expect(response).toBeDefined();
      expect(response.content).toBe('AI generated test response');
      expect(response.usage?.total_tokens).toBe(30);
    });

    it('throws error when API key is missing in development', async () => {
      delete process.env.OPENROUTER_API_KEY;
      (AIService as any).isDevelopment = true;

      await expect(
        AIService.generateResponse({
          messages: [{ role: 'user', content: 'Hello AI' }],
        })
      ).rejects.toThrow('OPENROUTER_API_KEY');
    });

    it('throws error when API key is missing in production', async () => {
      delete process.env.OPENAI_API_KEY;
      (AIService as any).isDevelopment = false;

      await expect(
        AIService.generateResponse({
          messages: [{ role: 'user', content: 'Hello AI' }],
        })
      ).rejects.toThrow('OPENAI_API_KEY');
    });
  });

  describe('generateWithOpenRouter and generateWithOpenAI helpers', () => {
    it('generateWithOpenRouter returns text response', async () => {
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
      (AIService as any).isDevelopment = true;

      const result = await AIService.generateWithOpenRouter({
        prompt: 'Test prompt',
      });
      expect(result).toBe('AI generated test response');
    });

    it('generateWithOpenAI returns text response in production mode', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      (AIService as any).isDevelopment = false;

      const result = await AIService.generateWithOpenAI({
        prompt: 'Test prompt',
      });
      expect(result).toBe('AI generated test response');
    });
  });
});
