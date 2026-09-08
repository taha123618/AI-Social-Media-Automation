import { DMAutomationService } from '../dm-automation.service';
import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    business: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
  prisma: {
    business: {
      findUnique: jest.fn(),
      update: jest.fn(),
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

describe('DMAutomationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRules', () => {
    it('returns stored rules or default starter templates', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue(null);

      const rules = await DMAutomationService.getRules('biz_dm_123');
      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0].triggerKeywords.length).toBeGreaterThan(0);
    });
  });

  describe('processIncomingDM', () => {
    it('matches keyword triggers and synthesizes helpful reply', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue(null);
      (AIService.generateResponse as jest.Mock).mockResolvedValue({
        content: 'Hi! Our starter package is $49/mo with full AI automation. Check it out on our site!',
      });

      const response = await DMAutomationService.processIncomingDM({
        businessId: 'biz_dm_123',
        platform: 'INSTAGRAM',
        senderName: 'Jordan',
        messageText: 'What are your monthly pricing rates?',
      });

      expect(response.intent).toBe('PRICING');
      expect(response.replyText).toContain('$49');
      expect(response.confidenceScore).toBeGreaterThanOrEqual(80);
    });
  });
});
