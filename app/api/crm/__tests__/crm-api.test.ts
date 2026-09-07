jest.mock('@/lib/prisma', () => {
  const businessMember = {
    findFirst: jest.fn(),
  };
  const thirdPartyService = {
    upsert: jest.fn(),
  };
  const client = { businessMember, thirdPartyService };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    businessMember,
    thirdPartyService,
  };
});

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/features/crm/services/crm.service', () => ({
  CrmService: {
    getStatus: jest.fn(),
    syncLeads: jest.fn(),
  },
}));

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CrmService } from '@/features/crm/services/crm.service';
import { GET, POST } from '../route';

describe('CRM Integration API (/api/crm)', () => {
  const mockUser = { id: 'usr_crm_tester', email: 'sales@agency.com' };
  const businessId = 'biz_crm_123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/crm', () => {
    it('rejects unauthenticated requests with 401', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/crm?businessId=biz_crm_123');
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('rejects non-member requests with 403 Forbidden', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/crm?businessId=biz_crm_123');
      const res = await GET(req);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Forbidden');
    });

    it('returns CRM status for verified business member', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (CrmService.getStatus as jest.Mock).mockResolvedValue({
        hubspot: { isConnected: true, lastSyncedAt: '2026-09-01T00:00:00Z' },
        salesforce: { isConnected: false },
      });

      const req = new Request(`http://localhost:3000/api/crm?businessId=${businessId}`);
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.hubspot.isConnected).toBe(true);
    });
  });

  describe('POST /api/crm', () => {
    it('rejects unauthenticated POST requests with 401', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_CONTACTS', businessId }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it('rejects foreign tenant POST requests with 403 Forbidden', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_CONTACTS', businessId }),
      });
      const res = await POST(req);

      expect(res.status).toBe(403);
    });

    it('executes SYNC_CONTACTS action for verified member', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (CrmService.syncLeads as jest.Mock).mockResolvedValue({
        success: true,
        syncedCount: 14,
      });

      const req = new Request('http://localhost:3000/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SYNC_CONTACTS',
          businessId,
          crmType: 'HUBSPOT',
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.syncedCount).toBe(14);
      expect(CrmService.syncLeads).toHaveBeenCalledWith(businessId, 'HUBSPOT');
    });

    it('updates CRM API configuration via UPDATE_CONFIG', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (prisma.thirdPartyService.upsert as jest.Mock).mockResolvedValue({});

      const req = new Request('http://localhost:3000/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_CONFIG',
          businessId,
          crmType: 'GOHIGHLEVEL',
          data: { apiKey: 'ghl_live_secret_key_123' },
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(prisma.thirdPartyService.upsert).toHaveBeenCalled();
    });

    it('returns 400 on unrecognized CRM action', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });

      const req = new Request('http://localhost:3000/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UNKNOWN_ACTION',
          businessId,
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain('Invalid action');
    });
  });
});
