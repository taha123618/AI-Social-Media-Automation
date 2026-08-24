import { CrmService } from '../crm.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    lead: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    thirdPartyService: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
  prisma: {
    lead: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    thirdPartyService: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('CrmService', () => {
  const businessId = 'biz_lead_test_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns early with count 0 if there are no new leads to sync', async () => {
    (prisma.lead.findMany as jest.Mock).mockResolvedValue([]);

    const result = await CrmService.syncLeads(businessId, 'GENERIC');

    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
    expect(prisma.lead.updateMany).not.toHaveBeenCalled();
  });

  it('syncs leads and updates status to SYNCED', async () => {
    const mockLeads = [
      {
        id: 'lead_1',
        name: 'Alice Smith',
        leadType: 'PHONE_CALL',
        estimatedValue: 1200,
        createdAt: new Date(),
      },
    ];

    (prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);
    (prisma.thirdPartyService.findFirst as jest.Mock).mockResolvedValue({
      id: 'srv_1',
      businessId,
      platform: 'GENERIC',
      apiKey: JSON.stringify({ webhookUrl: '' }),
    });
    (prisma.lead.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const result = await CrmService.syncLeads(businessId, 'GENERIC');

    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(prisma.lead.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['lead_1'] } },
      data: { status: 'SYNCED' },
    });
  });

  it('checks CRM connection status for a business', async () => {
    (prisma.thirdPartyService.findMany as jest.Mock).mockResolvedValue([
      { id: 'srv_1', platform: 'HUBSPOT', isActive: true },
    ]);

    const status = await CrmService.getStatus(businessId);

    expect(status.connected).toBe(true);
    expect(status.services.length).toBe(1);
    expect(status.services[0].platform).toBe('HUBSPOT');
  });
});
