import { MultiLocationService } from '../multi-location.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  business: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn().mockResolvedValue(true),
    logError: jest.fn().mockResolvedValue(true),
    error: jest.fn(),
  },
}));

jest.mock('@/services/ai/ai.service', () => ({
  AIService: {
    generateWithOpenRouter: jest.fn().mockResolvedValue('Local customized content for downtown location'),
  },
}));

jest.mock('@/services/ai/agents/multi-location.agent', () => ({
  multiLocationAgent: {
    generateResponse: jest.fn().mockResolvedValue('Strategic advice for multi-location brand expansion'),
  },
}));

jest.mock('@/services/ai/tools/multi-location.tool', () => ({
  multiLocationTool: {
    execute: jest.fn().mockResolvedValue({
      success: true,
      data: 'Adapted social media post customized for Downtown Branch',
    }),
  },
}));

describe('MultiLocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocations', () => {
    it('retrieves all locations for an organization', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_1',
        organizationId: 'org_123',
      });
      (prisma.business.findMany as jest.Mock).mockResolvedValue([
        { id: 'biz_1', name: 'Downtown Branch', location: '123 Main St', businessType: 'RESTAURANT' },
        { id: 'biz_2', name: 'Uptown Branch', location: '456 High St', businessType: 'RESTAURANT' },
      ]);

      const result = await MultiLocationService.getLocations('biz_1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(prisma.business.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org_123' },
        select: { id: true, name: true, location: true, businessType: true },
      });
    });
  });

  describe('getAggregatedAnalytics', () => {
    it('aggregates engagement and leads across all locations', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_1',
        organizationId: 'org_123',
      });
      (prisma.business.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'biz_1',
          posts: [
            { likes: 10, comments: 5, shares: 2, messageClicks: 3, bookingClicks: 1 },
          ],
        },
        {
          id: 'biz_2',
          posts: [
            { likes: 20, comments: 10, shares: 4, messageClicks: 2, bookingClicks: 2 },
          ],
        },
      ]);

      const result = await MultiLocationService.getAggregatedAnalytics('biz_1');

      expect(result.success).toBe(true);
      expect(result.data?.locationCount).toBe(2);
      expect(result.data?.totalEngagement).toBe(51); // 17 + 34
      expect(result.data?.totalLeads).toBe(8); // 4 + 4
    });
  });

  describe('syncGlobalSettings', () => {
    it('synchronizes brand voice preferences across all organization locations', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_1',
        organizationId: 'org_123',
      });
      (prisma.business.findMany as jest.Mock).mockResolvedValue([
        { id: 'biz_1', preferences: { theme: 'dark' } },
        { id: 'biz_2', preferences: { theme: 'light' } },
      ]);
      (prisma.business.update as jest.Mock).mockResolvedValue({});

      const result = await MultiLocationService.syncGlobalSettings('biz_1', {
        brandVoice: 'Energetic & Professional',
      });

      expect(result.success).toBe(true);
      expect(prisma.business.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('getStrategicAdvice', () => {
    it('queries multiLocationAgent for cross-location strategic advice', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_1',
        name: 'Apex Cafe',
        organizationId: 'org_123',
      });

      const result = await MultiLocationService.getStrategicAdvice(
        'biz_1',
        'How can we increase footfall in suburban locations?'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('Strategic advice for multi-location brand expansion');
    });
  });

  describe('customizeContentForLocation', () => {
    it('customizes post content using multiLocationTool', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'biz_1',
        name: 'Apex Cafe Downtown',
        location: '123 Main St',
        businessType: 'RESTAURANT',
        organizationId: 'org_123',
      });

      const result = await MultiLocationService.customizeContentForLocation(
        'biz_1',
        'Come enjoy 20% off all beverages today!'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('Adapted social media post customized for Downtown Branch');
    });
  });
});
