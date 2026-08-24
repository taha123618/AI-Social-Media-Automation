import { calculateRevenueAttribution } from '../revenue-attribution.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    business: {
      findUnique: jest.fn(),
    },
    lead: {
      findMany: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
  },
  prisma: {
    business: {
      findUnique: jest.fn(),
    },
    lead: {
      findMany: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
  },
}));

describe('RevenueAttributionService', () => {
  const businessId = 'biz_contractor_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computes attributed revenue and ROI from converted leads', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: businessId,
      profile: { industry: 'CONTRACTOR' },
    });

    const mockLeads = [
      {
        id: 'lead_1',
        businessId,
        sourcePostId: 'post_1',
        leadType: 'PHONE_CALL',
        status: 'CONVERTED',
        estimatedValue: 2500,
        createdAt: new Date(),
      },
      {
        id: 'lead_2',
        businessId,
        sourcePostId: 'post_1',
        leadType: 'BOOKING',
        status: 'CONVERTED',
        estimatedValue: 3000,
        createdAt: new Date(),
      },
      {
        id: 'lead_3',
        businessId,
        sourcePostId: 'post_2',
        leadType: 'WEBSITE_CLICK',
        status: 'NEW',
        estimatedValue: 500,
        createdAt: new Date(),
      },
    ];

    (prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);
    (prisma.post.findMany as jest.Mock).mockResolvedValue([
      { id: 'post_1', businessId },
      { id: 'post_2', businessId },
    ]);

    const attribution = await calculateRevenueAttribution(businessId, 90);

    expect(attribution.totalRevenue).toBeGreaterThan(0);
    expect(attribution.attributedRevenue).toBeGreaterThan(0);
    expect(attribution.attributionRate).toBeGreaterThanOrEqual(0);
    expect(attribution.attributionRate).toBeLessThanOrEqual(100);
    expect(typeof attribution.roi).toBe('number');
    expect(Array.isArray(attribution.revenueByPost)).toBe(true);
  });

  it('handles business with zero leads gracefully', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: businessId,
      profile: { industry: 'RETAIL' },
    });

    (prisma.lead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.post.findMany as jest.Mock).mockResolvedValue([]);

    const attribution = await calculateRevenueAttribution(businessId, 90);

    expect(attribution.totalRevenue).toBe(0);
    expect(attribution.attributedRevenue).toBe(0);
    expect(attribution.attributionRate).toBe(0);
  });
});
