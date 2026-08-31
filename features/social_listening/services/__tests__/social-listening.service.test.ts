import { SocialListeningService } from '../social-listening.service';
import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    business: {
      findUnique: jest.fn(),
    },
  },
  prisma: {
    business: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/services/ai/ai.service', () => ({
  AIService: {
    generateResponse: jest.fn(),
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
  },
}));

describe('SocialListeningService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRadarReport', () => {
    it('aggregates live mentions, competitor benchmarks, and generates AI executive briefing', async () => {
      const mockBusiness = {
        id: 'biz_listen_123',
        name: 'Apex Automation',
        industry: 'Software',
      };

      (prisma.business.findUnique as jest.Mock).mockResolvedValue(mockBusiness);
      (AIService.generateResponse as jest.Mock).mockResolvedValue({
        content: 'Brand sentiment is strongly positive with growing share of voice on X and Reddit.',
      });

      const report = await SocialListeningService.getRadarReport('biz_listen_123');

      expect(report.businessId).toBe('biz_listen_123');
      expect(report.overallSentimentScore).toBeGreaterThan(0);
      expect(report.mentions.length).toBeGreaterThan(0);
      expect(report.competitors.length).toBeGreaterThan(0);
      expect(report.trendingKeywords.length).toBeGreaterThan(0);
      expect(report.aiExecutiveSummary).toBeDefined();
    });
  });
});
