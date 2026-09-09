export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  workspaces: {
    all: ['workspaces'] as const,
    detail: (id: string) => ['workspaces', id] as const,
  },
  posts: {
    all: (workspaceId?: string) => ['posts', { workspaceId }] as const,
    list: (workspaceId?: string, status?: string) => ['posts', 'list', { workspaceId, status }] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
  },
  calendar: {
    slots: (workspaceId?: string) => ['calendar', 'slots', { workspaceId }] as const,
  },
  inbox: {
    conversations: (workspaceId?: string) => ['inbox', 'conversations', { workspaceId }] as const,
  },
  analytics: {
    overview: (workspaceId?: string) => ['analytics', 'overview', { workspaceId }] as const,
    growth: (workspaceId?: string) => ['analytics', 'growth', { workspaceId }] as const,
  },
  settings: {
    apiKeys: (workspaceId?: string) => ['settings', 'api-keys', { workspaceId }] as const,
    webhooks: (workspaceId?: string) => ['settings', 'webhooks', { workspaceId }] as const,
  },
} as const;
