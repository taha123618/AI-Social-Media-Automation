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
  arena: {
    comparison: (prompt: string) => ['arena', 'comparison', prompt] as const,
  },
  competitors: {
    list: (workspaceId?: string) => ['competitors', 'list', { workspaceId }] as const,
  },
  blog: {
    articles: (workspaceId?: string) => ['blog', 'articles', { workspaceId }] as const,
  },
  ads: {
    campaigns: (workspaceId?: string) => ['ads', 'campaigns', { workspaceId }] as const,
  },
  listening: {
    radar: (workspaceId?: string) => ['listening', 'radar', { workspaceId }] as const,
  },
  reviews: {
    list: (workspaceId?: string) => ['reviews', 'list', { workspaceId }] as const,
  },
  locations: {
    list: (workspaceId?: string) => ['locations', 'list', { workspaceId }] as const,
  },
  knowledge: {
    profile: (workspaceId?: string) => ['knowledge', 'profile', { workspaceId }] as const,
  },
  trends: {
    events: (workspaceId?: string) => ['trends', 'events', { workspaceId }] as const,
  },
  social: {
    accounts: (workspaceId?: string) => ['social', 'accounts', { workspaceId }] as const,
  },
  team: {
    members: (workspaceId?: string) => ['team', 'members', { workspaceId }] as const,
  },
  billing: {
    usage: (workspaceId?: string) => ['billing', 'usage', { workspaceId }] as const,
  },
  settings: {
    apiKeys: (workspaceId?: string) => ['settings', 'api-keys', { workspaceId }] as const,
    webhooks: (workspaceId?: string) => ['settings', 'webhooks', { workspaceId }] as const,
  },
} as const;
