import { http } from './client';
import { ApiKeysAndWebhooksResponse } from '@/types/api';

export const settingsApi = {
  getApiKeysAndWebhooks: async (): Promise<ApiKeysAndWebhooksResponse> => {
    try {
      const [keysRes, hooksRes] = await Promise.allSettled([
        http.get<any>('/api/settings/api-keys'),
        http.get<any>('/api/settings/webhooks'),
      ]);

      const keysData = keysRes.status === 'fulfilled' ? keysRes.value : null;
      const hooksData = hooksRes.status === 'fulfilled' ? hooksRes.value : null;

      const rawKeys = keysData?.keys || (Array.isArray(keysData) ? keysData : []);
      const rawWebhooks = hooksData?.webhooks || (Array.isArray(hooksData) ? hooksData : []);

      const apiKeys = rawKeys.map((k: any) => ({
        id: k.id,
        name: k.name || 'API Key',
        keyMasked: k.key ? `${k.key.slice(0, 8)}••••••••••••${k.key.slice(-4)}` : 'sai_live_••••••••••••',
        fullKey: k.key || k.fullKey,
        type: (k.type || (k.name?.toLowerCase().includes('sandbox') ? 'SANDBOX' : 'PRODUCTION')) as 'PRODUCTION' | 'SANDBOX',
        createdAt: k.createdAt || new Date().toISOString(),
        lastUsedAt: k.lastUsedAt || 'Recently',
      }));

      const webhooks = rawWebhooks.map((w: any) => ({
        id: w.id,
        url: w.url,
        eventTypes: w.events || w.eventTypes || ['post.published'],
        status: (w.isActive ?? true) ? 'ACTIVE' : 'PAUSED',
        latencyMs: w.latencyMs || 120,
        lastTriggeredAt: w.lastTriggeredAt || 'Never',
      }));

      return {
        apiKeys,
        webhooks,
        hmacSecret: keysData?.hmacSecret || hooksData?.hmacSecret || '',
      };
    } catch (err) {
      console.warn('[SettingsAPI] Could not fetch live API keys/webhooks:', err);
      return {
        apiKeys: [],
        webhooks: [],
        hmacSecret: '',
      };
    }
  },
};
