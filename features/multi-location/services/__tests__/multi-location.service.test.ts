import { MultiLocationService } from '../multi-location.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/lib/prisma', () => {
  const business = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  };
  const client = { business };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
  };
});

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MultiLocationService', () => {
  const businessId = 'biz_hq_1';
  const orgId = 'org_franchise_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocations', () => {
    it('retrieves all locations for an organization', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: businessId,
        organizationId: orgId,
      });
      (prisma.business.findMany as jest.Mock).mockResolvedValue([
        { id: 'biz_1', name: 'Downtown Branch', location: 'New York, NY', businessType: 'RESTAURANT' },
        { id: 'biz_2', name: 'Uptown Branch', location: 'Boston, MA', businessType: 'RESTAURANT' },
      ]);

      const res = await MultiLocationService.getLocations(businessId);
      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(2);
      expect(prisma.business.findMany).toHaveBeenCalledWith({
        where: { organizationId: orgId },
        select: expect.any(Object),
      });
    });
  });

  describe('getAggregatedAnalytics', () => {
    it('aggregates engagement and click metrics across all franchise locations', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: businessId,
        organizationId: orgId,
      });
      (prisma.business.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'biz_1',
          name: 'Downtown',
          posts: [
            { likes: 100, comments: 20, shares: 10, messageClicks: 5, bookingClicks: 15 },
          ],
        },
        {
          id: 'biz_2',
          name: 'Uptown',
          posts: [
            { likes: 50, comments: 10, shares: 5, messageClicks: 2, bookingClicks: 8 },
          ],
        },
      ]);

      const res = await MultiLocationService.getAggregatedAnalytics(businessId);
      expect(res.success).toBe(true);
      expect(res.data?.locationCount).toBe(2);
      expect(res.data?.totalEngagement).toBe(195);
      expect(res.data?.totalLeads).toBe(30);
    });
  });
});
