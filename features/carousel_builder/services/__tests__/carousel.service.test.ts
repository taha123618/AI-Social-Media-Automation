import { CarouselService, CAROUSEL_THEMES } from '../carousel.service';
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
    logError: jest.fn(),
  },
}));

describe('CarouselService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getThemes', () => {
    it('returns all supported visual themes', () => {
      const themes = CarouselService.getThemes();
      expect(themes.length).toBe(6);
      expect(themes.map((t) => t.id)).toContain('DARK_GLASS');
      expect(themes.map((t) => t.id)).toContain('CYBER_NEON');
      expect(themes.map((t) => t.id)).toContain('MINIMAL_LIGHT');
    });
  });

  describe('generateCarouselDeck', () => {
    it('generates a structured deck via AIService', async () => {
      const mockBusiness = {
        id: 'biz_carousel_123',
        name: 'TechFlow SaaS',
        profile: { tone: 'Direct and data-driven', targetAudience: 'CTOs' },
        brandProfiles: [],
      };

      (prisma.business.findUnique as jest.Mock).mockResolvedValue(mockBusiness);

      const mockAISlideJson = JSON.stringify({
        title: '5 AI Workflow Strategies',
        caption: 'Here are the top 5 strategies to 10x output.',
        hashtags: ['#AI', '#Productivity', '#SaaS'],
        slides: [
          {
            slideNumber: 1,
            layout: 'TITLE',
            headline: '5 AI Multi-Agent Strategies',
            subheadline: 'How modern engineering teams scale',
            highlightText: 'EXECUTIVE BRIEF',
          },
          {
            slideNumber: 2,
            layout: 'STATISTIC',
            headline: 'Efficiency Multiplier',
            statValue: '4.2x',
            statLabel: 'Sprint velocity increase',
            bodyText: 'Teams deploying autonomous agents see immediate gains.',
          },
          {
            slideNumber: 3,
            layout: 'CTA',
            headline: 'Scale Your Pipeline',
            ctaButtonText: 'Start Free Trial',
          },
        ],
      });

      (AIService.generateResponse as jest.Mock).mockResolvedValue({ content: mockAISlideJson });

      const deck = await CarouselService.generateCarouselDeck({
        businessId: 'biz_carousel_123',
        topic: 'AI Workflow Strategies',
        targetPlatform: 'LINKEDIN',
        theme: 'DARK_GLASS',
        slideCount: 3,
      });

      expect(deck.businessId).toBe('biz_carousel_123');
      expect(deck.title).toBe('5 AI Workflow Strategies');
      expect(deck.slides.length).toBe(3);
      expect(deck.slides[0].layout).toBe('TITLE');
      expect(deck.slides[1].layout).toBe('STATISTIC');
      expect(deck.slides[1].statValue).toBe('4.2x');
      expect(deck.hashtags).toContain('#AI');
    });

    it('falls back gracefully to deterministic generator when AIService throws', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue(null);
      (AIService.generateResponse as jest.Mock).mockRejectedValue(new Error('AI Rate Limit'));

      const deck = await CarouselService.generateCarouselDeck({
        businessId: 'biz_fallback_123',
        topic: 'Autonomous Social Automation',
        targetPlatform: 'INSTAGRAM',
        slideCount: 5,
      });

      expect(deck.businessId).toBe('biz_fallback_123');
      expect(deck.slides.length).toBe(5);
      expect(deck.slides[0].layout).toBe('TITLE');
      expect(deck.slides[deck.slides.length - 1].layout).toBe('CTA');
    });
  });
});
