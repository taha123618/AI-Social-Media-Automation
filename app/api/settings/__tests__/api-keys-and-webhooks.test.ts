import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => {
  const businessMember = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  };
  const client = { businessMember };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    businessMember,
  };
});

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/features/settings/services/settings.service', () => ({
  SettingsService: {
    getApiKeys: jest.fn(),
    createApiKey: jest.fn(),
    deleteApiKey: jest.fn(),
    getWebhooks: jest.fn(),
    createWebhook: jest.fn(),
    deleteWebhook: jest.fn(),
  },
}));

jest.mock('@/lib/guards/entitlement.guard', () => ({
  EntitlementGuard: {
    requireFeature: jest.fn(),
  },
}));

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { SettingsService } from '@/features/settings/services/settings.service';
import { EntitlementGuard } from '@/lib/guards/entitlement.guard';
import { GET as getApiKeys, POST as createApiKey } from '../api-keys/route';
import { DELETE as deleteApiKey } from '../api-keys/[id]/route';
import { GET as getWebhooks, POST as createWebhook } from '../webhooks/route';
import { DELETE as deleteWebhook } from '../webhooks/[id]/route';

describe('Settings API - API Keys & Webhooks Gateways', () => {
  const mockUser = { id: 'usr_settings_1', email: 'dev@company.com' };
  const businessId = 'biz_settings_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Developer API Keys Endpoint (/api/settings/api-keys)', () => {
    it('returns 401 Unauthorized if user session is absent', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/settings/api-keys');
      const res = await getApiKeys(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 400 if x-business-id header is missing', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });

      const req = new NextRequest('http://localhost:3000/api/settings/api-keys');
      const res = await getApiKeys(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Business ID required');
    });

    it('returns 403 Forbidden if user is not a member of the requested business', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/settings/api-keys', {
        headers: { 'x-business-id': businessId },
      });
      const res = await getApiKeys(req);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('Forbidden');
    });

    it('enforces EntitlementGuard and blocks free users from api_access', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });

      const { NextResponse } = require('next/server');
      (EntitlementGuard.requireFeature as jest.Mock).mockResolvedValue(
        NextResponse.json({ error: 'FEATURE_NOT_AVAILABLE', requiredPlan: 'Pro' }, { status: 403 })
      );

      const req = new NextRequest('http://localhost:3000/api/settings/api-keys', {
        headers: { 'x-business-id': businessId },
      });
      const res = await getApiKeys(req);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('FEATURE_NOT_AVAILABLE');
    });

    it('successfully fetches API keys for authorized and entitled business members', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (EntitlementGuard.requireFeature as jest.Mock).mockResolvedValue(null);
      (SettingsService.getApiKeys as jest.Mock).mockResolvedValue([
        { id: 'key_1', name: 'Production Bot', prefix: 'soc_live_123', createdAt: new Date() },
      ]);

      const req = new NextRequest('http://localhost:3000/api/settings/api-keys', {
        headers: { 'x-business-id': businessId },
      });
      const res = await getApiKeys(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Production Bot');
    });

    it('rejects API key creation with empty permissions or missing name', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (EntitlementGuard.requireFeature as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/settings/api-keys', {
        method: 'POST',
        headers: { 'x-business-id': businessId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', permissions: [] }),
      });
      const res = await createApiKey(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation Error');
    });

    it('deletes API key when requested by authorized business member', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (SettingsService.deleteApiKey as jest.Mock).mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3000/api/settings/api-keys/key_999', {
        method: 'DELETE',
        headers: { 'x-business-id': businessId },
      });
      const res = await deleteApiKey(req, { params: Promise.resolve({ id: 'key_999' }) });

      expect(res.status).toBe(200);
      expect(SettingsService.deleteApiKey).toHaveBeenCalledWith(businessId, 'key_999');
    });
  });

  describe('Outbound Webhooks Gateway Endpoint (/api/settings/webhooks)', () => {
    it('returns webhooks list for authorized business members', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (SettingsService.getWebhooks as jest.Mock).mockResolvedValue([
        { id: 'wh_1', name: 'Zapier Dispatch', url: 'https://hooks.zapier.com/123', events: ['post.published'] },
      ]);

      const req = new NextRequest('http://localhost:3000/api/settings/webhooks', {
        headers: { 'x-business-id': businessId },
      });
      const res = await getWebhooks(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(1);
      expect(data[0].url).toBe('https://hooks.zapier.com/123');
    });

    it('validates webhook creation URL and event requirements', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });

      const req = new NextRequest('http://localhost:3000/api/settings/webhooks', {
        method: 'POST',
        headers: { 'x-business-id': businessId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Invalid Webhook', url: 'not-a-valid-url', events: [] }),
      });
      const res = await createWebhook(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation Error');
    });

    it('successfully creates a valid webhook endpoint', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (SettingsService.createWebhook as jest.Mock).mockResolvedValue({
        id: 'wh_created_1',
        name: 'CRM Webhook',
        url: 'https://api.mycrm.com/webhook',
        events: ['lead.captured'],
      });

      const req = new NextRequest('http://localhost:3000/api/settings/webhooks', {
        method: 'POST',
        headers: { 'x-business-id': businessId, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'CRM Webhook',
          url: 'https://api.mycrm.com/webhook',
          events: ['lead.captured'],
        }),
      });
      const res = await createWebhook(req);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBe('wh_created_1');
    });

    it('deletes webhook endpoint for authorized business member', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findUnique as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (SettingsService.deleteWebhook as jest.Mock).mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3000/api/settings/webhooks/wh_123', {
        method: 'DELETE',
        headers: { 'x-business-id': businessId },
      });
      const res = await deleteWebhook(req, { params: Promise.resolve({ id: 'wh_123' }) });

      expect(res.status).toBe(200);
      expect(SettingsService.deleteWebhook).toHaveBeenCalledWith(businessId, 'wh_123');
    });
  });
});
