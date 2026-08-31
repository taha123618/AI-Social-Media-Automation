import { WebhookService } from '../webhook.service';
import prisma from '@/lib/prisma';

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

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logAudit: jest.fn(),
    logActivity: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('WebhookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSecret & generateSignature', () => {
    it('generates a secret prefixed with whsec_', () => {
      const secret = WebhookService.generateSecret();
      expect(secret.startsWith('whsec_')).toBe(true);
      expect(secret.length).toBeGreaterThan(20);
    });

    it('generates consistent HMAC SHA-256 signatures', () => {
      const payload = JSON.stringify({ test: true, event: 'post.published' });
      const secret = 'whsec_test_secret_123';
      const sig1 = WebhookService.generateSignature(payload, secret);
      const sig2 = WebhookService.generateSignature(payload, secret);

      expect(sig1.startsWith('sha256=')).toBe(true);
      expect(sig1).toBe(sig2);
    });
  });

  describe('createEndpoint', () => {
    it('creates a new webhook endpoint and updates business preferences', async () => {
      const mockBusiness = {
        id: 'biz_wh_123',
        preferences: { webhooks: [] },
      };

      (prisma.business.findUnique as jest.Mock).mockResolvedValue(mockBusiness);
      (prisma.business.update as jest.Mock).mockResolvedValue({ ...mockBusiness });

      const endpoint = await WebhookService.createEndpoint({
        businessId: 'biz_wh_123',
        url: 'https://example.com/webhook',
        description: 'Test Webhook',
        events: ['post.published', 'lead.captured'],
      });

      expect(endpoint.businessId).toBe('biz_wh_123');
      expect(endpoint.url).toBe('https://example.com/webhook');
      expect(endpoint.secret.startsWith('whsec_')).toBe(true);
      expect(endpoint.events).toContain('post.published');
      expect(prisma.business.update).toHaveBeenCalled();
    });
  });

  describe('sendWebhook', () => {
    it('sends payload with correct headers and returns delivery log', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve('{"received": true}'),
      });

      const endpoint = {
        id: 'whep_123',
        businessId: 'biz_wh_123',
        url: 'https://example.com/webhook',
        secret: 'whsec_test_123',
        events: ['post.published' as const],
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const log = await WebhookService.sendWebhook(endpoint, 'post.published', {
        postId: 'post_123',
        title: 'New Announcement',
      });

      expect(log.status).toBe('DELIVERED');
      expect(log.statusCode).toBe(200);
      expect(log.durationMs).toBeGreaterThanOrEqual(0);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Webhook-Event': 'post.published',
          }),
        })
      );
    });
  });
});
