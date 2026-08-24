import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface BusinessSettings {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  logo: string | null;
  description: string | null;
  industry: string | null;
  size: string | null;
  timezone: string;
  defaultPlatforms: string[];
  autoApproveContent: boolean;
  requireApprovalForPosts: boolean;
  contentGuidelines: string | null;
  mission: string | null;
  vision: string | null;
  uvp: string | null;
  targetAudience: string | null;
  tone: string | null;
  forbiddenWords: string[];
  usp: string | null;
  watermark: string | null;
  city?: string | null;
  location?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessSettingsUpdate {
  name?: string;
  website?: string | null;
  location?: any | null;
  logo?: string | null;
  description?: string | null;
  industry?: string | null;
  size?: string | null;
  timezone?: string;
  autoApproveContent?: boolean;
  requireApprovalForPosts?: boolean;
  contentGuidelines?: string | null;
}

export interface BusinessProfileUpdate {
  mission?: string;
  vision?: string;
  uvp?: string;
  targetAudience?: string;
  tone?: string;
  industry?: string;
  forbiddenWords?: string[];
  usp?: string;
  watermark?: string;
}

export interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  timezone: string;
  language: string;
  // Email Dispatch Protocol
  criticalInfrastructureUpdates: boolean;
  strategicIntelligence: boolean;
  // Real-Time Push Array
  osLevelSignals: boolean;
  // Active Signal Feed
  contentPhaseSuccess: boolean;
  securityFirewallAlerts: boolean;
  collaboratorInvitations: boolean;
  globalSystemHealth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettingsUpdate {
  name?: string;
  timezone?: string;
  language?: string;
  // Email Dispatch Protocol
  criticalInfrastructureUpdates?: boolean;
  strategicIntelligence?: boolean;
  // Real-Time Push Array
  osLevelSignals?: boolean;
  // Active Signal Feed
  contentPhaseSuccess?: boolean;
  securityFirewallAlerts?: boolean;
  collaboratorInvitations?: boolean;
  globalSystemHealth?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface ApiKeyCreateInput {
  name: string;
  permissions: string[];
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string | null;
  lastTriggered: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookCreateInput {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive?: boolean;
}

// API Client with businessId header
const createSettingsApi = (businessId: string) => ({
  getSettings: () =>
    axios.get('/api/settings', {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  updateBusinessSettings: (data: BusinessSettingsUpdate) =>
    axios.put('/api/settings?type=business', data, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  updateBusinessProfile: (data: BusinessProfileUpdate) =>
    axios.put('/api/settings?type=profile', data, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  // User Settings
  getUserSettings: () =>
    axios.get('/api/settings/user').then(res => res.data),

  updateUserSettings: (data: UserSettingsUpdate) =>
    axios.put('/api/settings/user', data).then(res => res.data),

  // API Keys
  getApiKeys: () =>
    axios.get('/api/settings/api-keys', {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  createApiKey: (data: ApiKeyCreateInput) =>
    axios.post('/api/settings/api-keys', data, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  deleteApiKey: (keyId: string) =>
    axios.delete(`/api/settings/api-keys/${keyId}`, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  // Webhooks
  getWebhooks: () =>
    axios.get('/api/settings/webhooks', {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  createWebhook: (data: WebhookCreateInput) =>
    axios.post('/api/settings/webhooks', data, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  updateWebhook: (webhookId: string, data: Partial<WebhookCreateInput>) =>
    axios.put(`/api/settings/webhooks/${webhookId}`, data, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),

  deleteWebhook: (webhookId: string) =>
    axios.delete(`/api/settings/webhooks/${webhookId}`, {
      headers: { 'x-business-id': businessId }
    }).then(res => res.data),
});

// React Query Hooks
export const useSettings = (businessId: string) => {
  const api = createSettingsApi(businessId);

  return useQuery<BusinessSettings>({
    queryKey: ['settings', businessId],
    queryFn: api.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!businessId,
  });
};

export const useUpdateBusinessSettings = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createSettingsApi(businessId);

  return useMutation({
    mutationFn: api.updateBusinessSettings,
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['settings', businessId] });
    },
  });
};

export const useUpdateBusinessProfile = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createSettingsApi(businessId);

  return useMutation({
    mutationFn: api.updateBusinessProfile,
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['settings', businessId] });
    },
  });
};

// User Settings Hooks
export const useUserSettings = () => {
  const api = createSettingsApi(''); // No businessId needed for user settings

  return useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: api.getUserSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  const api = createSettingsApi('');

  return useMutation({
    mutationFn: api.updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
};

// API Keys Hooks
export const useApiKeys = (businessId: string) => {
  const api = createSettingsApi(businessId);

  return useQuery<ApiKey[]>({
    queryKey: ['apiKeys', businessId],
    queryFn: api.getApiKeys,
    staleTime: 5 * 60 * 1000,
    enabled: !!businessId,
  });
};

export const useCreateApiKey = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createSettingsApi(businessId);

  return useMutation({
    mutationFn: api.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', businessId] });
    },
  });
};

export const useDeleteApiKey = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createSettingsApi(businessId);

  return useMutation({
    mutationFn: api.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', businessId] });
    },
  });
};

// Webhooks Hooks
export const useWebhooks = (businessId: string) => {
  const api = createSettingsApi(businessId);

  return useQuery<Webhook[]>({
    queryKey: ['webhooks', businessId],
    queryFn: api.getWebhooks,
    staleTime: 5 * 60 * 1000,
    enabled: !!businessId,
  });
};

export const useCreateWebhook = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createSettingsApi(businessId);

  return useMutation({
    mutationFn: api.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', businessId] });
    },
  });
};

export const useUpdateWebhook = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createSettingsApi(businessId);

  return useMutation({
    mutationFn: ({ webhookId, data }: { webhookId: string; data: Partial<WebhookCreateInput> }) =>
      api.updateWebhook(webhookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', businessId] });
    },
  });
};

export const useDeleteWebhook = (businessId: string) => {
  const queryClient = useQueryClient();
  const api = createSettingsApi(businessId);

  return useMutation({
    mutationFn: api.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', businessId] });
    },
  });
};