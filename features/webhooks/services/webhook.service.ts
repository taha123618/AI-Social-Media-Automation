import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import {
  CreateWebhookEndpointInput,
  DispatchWebhookPayload,
  WebhookDeliveryLog,
  WebhookEndpoint,
  WebhookEvent,
} from '../types/webhook.types';

export class WebhookService {
  /**
   * Generate a cryptographically secure signing secret
   */
  static generateSecret(): string {
    return `whsec_${crypto.randomBytes(24).toString('hex')}`;
  }

  /**
   * Generate HMAC SHA-256 signature for outgoing webhook payload
   */
  static generateSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    return `sha256=${hmac.update(payload).digest('hex')}`;
  }

  /**
   * Get all registered webhook endpoints for a business
   */
  static async getEndpoints(businessId: string): Promise<WebhookEndpoint[]> {
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { preferences: true },
      });

      const prefs = (business?.preferences as any) || {};
      return Array.isArray(prefs.webhooks) ? prefs.webhooks : [];
    } catch (err) {
      console.warn('[WEBHOOKS] Error fetching endpoints:', err);
      return [];
    }
  }

  /**
   * Register a new webhook endpoint
   */
  static async createEndpoint(input: CreateWebhookEndpointInput): Promise<WebhookEndpoint> {
    const { businessId, url, description, events } = input;

    const newEndpoint: WebhookEndpoint = {
      id: `whep_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      businessId,
      url,
      description,
      secret: WebhookService.generateSecret(),
      events: events && events.length > 0 ? events : ['post.published', 'lead.captured'],
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { preferences: true },
    });

    const prefs = (business?.preferences as any) || {};
    const existingWebhooks: WebhookEndpoint[] = Array.isArray(prefs.webhooks) ? prefs.webhooks : [];

    await prisma.business.update({
      where: { id: businessId },
      data: {
        preferences: {
          ...prefs,
          webhooks: [...existingWebhooks, newEndpoint],
        },
      },
    });

    await SystemLogger.logAudit({
      action: 'WEBHOOK_ENDPOINT_CREATED',
      resource: 'Webhook',
      status: 'SUCCESS',
      details: { url, events: newEndpoint.events, endpointId: newEndpoint.id },
    });

    return newEndpoint;
  }

  /**
   * Delete a webhook endpoint
   */
  static async deleteEndpoint(businessId: string, endpointId: string): Promise<{ success: boolean }> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { preferences: true },
    });

    const prefs = (business?.preferences as any) || {};
    const existingWebhooks: WebhookEndpoint[] = Array.isArray(prefs.webhooks) ? prefs.webhooks : [];

    const filtered = existingWebhooks.filter((ep) => ep.id !== endpointId);

    await prisma.business.update({
      where: { id: businessId },
      data: {
        preferences: {
          ...prefs,
          webhooks: filtered,
        },
      },
    });

    await SystemLogger.logAudit({
      action: 'WEBHOOK_ENDPOINT_DELETED',
      resource: 'Webhook',
      status: 'SUCCESS',
      details: { endpointId },
    });

    return { success: true };
  }

  /**
   * Dispatch a real-time event to all registered and active endpoints
   */
  static async dispatchEvent(payload: DispatchWebhookPayload): Promise<WebhookDeliveryLog[]> {
    const { businessId, event, data } = payload;
    const endpoints = await WebhookService.getEndpoints(businessId);
    const matchingEndpoints = endpoints.filter((ep) => ep.isActive && ep.events.includes(event));

    const deliveryLogs: WebhookDeliveryLog[] = [];

    for (const ep of matchingEndpoints) {
      const log = await WebhookService.sendWebhook(ep, event, data);
      deliveryLogs.push(log);
    }

    return deliveryLogs;
  }

  /**
   * Send a single webhook payload with HMAC signature and latency measurement
   */
  static async sendWebhook(
    endpoint: WebhookEndpoint,
    event: WebhookEvent,
    data: Record<string, any>
  ): Promise<WebhookDeliveryLog> {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      id: `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      event,
      timestamp,
      businessId: endpoint.businessId,
      data,
    };

    const serializedPayload = JSON.stringify(eventPayload);
    const signature = WebhookService.generateSignature(serializedPayload, endpoint.secret);

    const start = Date.now();
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Social-Automation-Webhook/2.0',
          'X-Hub-Signature-256': signature,
          'X-Webhook-Event': event,
          'X-Webhook-Delivery': eventPayload.id,
        },
        body: serializedPayload,
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      const durationMs = Date.now() - start;
      const responseBody = await response.text().catch(() => '');

      const log: WebhookDeliveryLog = {
        id: `del_${Date.now()}`,
        endpointId: endpoint.id,
        event,
        payload: eventPayload,
        statusCode: response.status,
        responseBody: responseBody.slice(0, 500),
        durationMs,
        status: response.ok ? 'DELIVERED' : 'FAILED',
        deliveredAt: timestamp,
      };

      return log;
    } catch (err: any) {
      const durationMs = Date.now() - start;

      const log: WebhookDeliveryLog = {
        id: `del_${Date.now()}`,
        endpointId: endpoint.id,
        event,
        payload: eventPayload,
        durationMs,
        status: 'FAILED',
        errorMessage: err.message || 'Connection timeout or network error',
        deliveredAt: timestamp,
      };

      return log;
    }
  }
}
