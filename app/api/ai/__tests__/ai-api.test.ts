const mockGetSession = jest.fn();
const mockFindFirstMember = jest.fn();

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    businessMember: {
      findFirst: (...args: any[]) => mockFindFirstMember(...args),
      findUnique: jest.fn().mockResolvedValue({ id: 'bm-1', role: 'ADMIN', businessId: 'biz-123', userId: 'user-1' }),
    },
    business: {
      findUnique: jest.fn().mockResolvedValue({ id: 'biz-123', name: 'Acme Coffee' }),
    },
    post: {
      count: jest.fn().mockResolvedValue(10),
      aggregate: jest.fn().mockResolvedValue({ _sum: { likes: 50, comments: 20, shares: 10 } }),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'post-new-1', title: 'New Post' }),
    },
    lead: {
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([]),
    },
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    activityLog: { create: jest.fn() },
  },
  prisma: {
    businessMember: {
      findFirst: (...args: any[]) => mockFindFirstMember(...args),
      findUnique: jest.fn().mockResolvedValue({ id: 'bm-1', role: 'ADMIN', businessId: 'biz-123', userId: 'user-1' }),
    },
    business: {
      findUnique: jest.fn().mockResolvedValue({ id: 'biz-123', name: 'Acme Coffee' }),
    },
    post: {
      count: jest.fn().mockResolvedValue(10),
      aggregate: jest.fn().mockResolvedValue({ _sum: { likes: 50, comments: 20, shares: 10 } }),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'post-new-1', title: 'New Post' }),
    },
    lead: {
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([]),
    },
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    activityLog: { create: jest.fn() },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: any[]) => mockGetSession(...args),
    },
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logInfo: jest.fn(),
    logWarn: jest.fn(),
    logError: jest.fn(),
    logActivity: jest.fn(),
  },
}));

import { NextRequest } from 'next/server';
import { GET as getAgents, POST as postAgents } from '../agents/route';
import { GET as getTools, POST as postTools } from '../tools/route';
import { GET as getWorkflows, POST as postWorkflows } from '../workflows/route';
import { AIService } from '@/services/ai/ai.service';
import { GrowthAnalyticsService } from '@/features/analytics/services/growth-analytics.service';

describe('Custom AI API Endpoints (/api/ai/*)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    });
    mockFindFirstMember.mockResolvedValue({
      id: 'bm-1',
      role: 'ADMIN',
      businessId: 'biz-123',
      userId: 'user-1',
    });

    jest.spyOn(AIService, 'generateWithOpenRouter').mockResolvedValue('Agent AI response output');
    jest.spyOn(AIService, 'generateResponse').mockResolvedValue({
      content: 'Workflow AI text',
      usage: { prompt_tokens: 10, completion_tokens: 15, total_tokens: 25 },
    });
    jest.spyOn(AIService, 'generateCompletion').mockResolvedValue({
      content: '<h1>Blog Post Content</h1>',
    });
    jest.spyOn(AIService, 'generateJSON').mockResolvedValue({
      outline: ['Intro', 'Body', 'Conclusion'],
      keywords: ['coffee', 'local cafe'],
    } as any);

    jest.spyOn(GrowthAnalyticsService, 'getGrowthDashboard').mockResolvedValue({
      success: true,
      metrics: {
        leadsCaptured: 2,
        totalEngagement: 50,
        postsPublished: 10,
        consistencyScore: 80,
        estimatedRevenueImpact: 3000,
        responseTime: '10m',
      },
    } as any);
  });

  describe('Agents API (/api/ai/agents)', () => {
    it('GET returns list of all available agents', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/agents');
      const res = await getAgents(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.agents.length).toBeGreaterThan(0);
      expect(data.agents.some((a: any) => a.id === 'analyticsAgent')).toBe(true);
      expect(data.agents.some((a: any) => a.id === 'postCreationAgent')).toBe(true);
    });

    it('POST executes specified agent', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/agents', {
        method: 'POST',
        headers: {
          'x-business-id': 'biz-123',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          agent: 'analyticsAgent',
          prompt: 'Analyze our quarterly growth trajectory',
        }),
      });

      const res = await postAgents(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.response).toBe('Agent AI response output');
    });

    it('POST returns 404 for unknown agent', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/agents', {
        method: 'POST',
        headers: {
          'x-business-id': 'biz-123',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          agent: 'unknownAgent123',
          prompt: 'Hello',
        }),
      });

      const res = await postAgents(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('Tools API (/api/ai/tools)', () => {
    it('GET returns list of all available tools', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/tools');
      const res = await getTools(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tools.length).toBeGreaterThan(0);
      expect(data.tools.some((t: any) => t.id === 'calculate-growth-score')).toBe(true);
    });

    it('POST executes specified tool with input validation', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/tools', {
        method: 'POST',
        headers: {
          'x-business-id': 'biz-123',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'calculate-growth-score',
          input: {
            businessId: 'biz-123',
            days: 30,
          },
        }),
      });

      const res = await postTools(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
    });
  });

  describe('Workflows API (/api/ai/workflows)', () => {
    it('GET returns list of all available workflows', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/workflows');
      const res = await getWorkflows(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.workflows.length).toBeGreaterThan(0);
      expect(data.workflows.some((w: any) => w.id === 'blog-generation-workflow')).toBe(true);
    });

    it('POST executes specified workflow', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/workflows', {
        method: 'POST',
        headers: {
          'x-business-id': 'biz-123',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          workflow: 'blog-generation-workflow',
          input: {
            topic: '10 Tips for Better Local Marketing',
            businessId: 'biz-123',
          },
        }),
      });

      const res = await postWorkflows(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
    });
  });
});
