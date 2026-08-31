import { BrandGuardianService } from '../brand-guardian.service';
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

describe('BrandGuardianService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auditCopy', () => {
    it('returns 100% compliant result when empty text is provided', async () => {
      const result = await BrandGuardianService.auditCopy({
        businessId: 'biz_bg_123',
        text: '',
      });

      expect(result.overallScore).toBe(100);
      expect(result.grade).toBe('A+');
      expect(result.isCompliant).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('detects forbidden words configured in brand profile', async () => {
      const mockBusiness = {
        id: 'biz_bg_123',
        profile: {
          forbiddenWords: ['synergy', 'disruptive', 'cheap'],
          tone: 'Authoritative',
        },
        brandProfiles: [],
      };

      (prisma.business.findUnique as jest.Mock).mockResolvedValue(mockBusiness);

      (AIService.generateResponse as jest.Mock).mockResolvedValue({
        content: JSON.stringify({
          toneAlignmentScore: 90,
          sentiment: 'POSITIVE',
          analysisSummary: 'Good copy overall.',
          additionalViolations: [],
          polishedCopy: 'Our modern solution helps teams scale.',
        }),
      });

      const result = await BrandGuardianService.auditCopy({
        businessId: 'biz_bg_123',
        text: 'We deliver cheap and disruptive solutions for your enterprise.',
        platform: 'LINKEDIN',
      });

      expect(result.violations.some((v) => v.type === 'FORBIDDEN_WORD' && v.highlightedText === 'cheap')).toBe(true);
      expect(result.violations.some((v) => v.type === 'FORBIDDEN_WORD' && v.highlightedText === 'disruptive')).toBe(true);
      expect(result.isCompliant).toBe(false);
    });

    it('detects Twitter character limit violations', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue(null);
      (AIService.generateResponse as jest.Mock).mockResolvedValue({
        content: JSON.stringify({
          toneAlignmentScore: 85,
          sentiment: 'NEUTRAL',
          analysisSummary: 'Text is too long for X.',
          additionalViolations: [],
        }),
      });

      const longTweet = 'A'.repeat(300);
      const result = await BrandGuardianService.auditCopy({
        businessId: 'biz_bg_123',
        text: longTweet,
        platform: 'TWITTER',
      });

      expect(result.violations.some((v) => v.type === 'LENGTH')).toBe(true);
    });
  });

  describe('calculateReadability', () => {
    it('calculates higher readability score for short, clear sentences', () => {
      const easyText = 'We make software. It helps you save time. It is fast and easy to use.';
      const { readingScore, gradeLevel } = BrandGuardianService.calculateReadability(easyText);

      expect(readingScore).toBeGreaterThan(60);
      expect(gradeLevel).toBeDefined();
    });
  });
});
