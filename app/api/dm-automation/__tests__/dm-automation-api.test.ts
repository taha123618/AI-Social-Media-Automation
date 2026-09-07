import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => {
  const businessMember = {
    findFirst: jest.fn(),
  };
  const business = {
    findUnique: jest.fn(),
  };
  const client = { businessMember, business };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    businessMember,
    business,
  };
});

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/features/dm_automation/services/dm-automation.service', () => ({
  DMAutomationService: {
    processIncomingDM: jest.fn(),
    getRules: jest.fn(),
    saveRule: jest.fn(),
  },
}));

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { DMAutomationService } from '@/features/dm_automation/services/dm-automation.service';
import { POST as simulateDM } from '../simulate/route';
import { GET as getRules, POST as createRule } from '../rules/route';

describe('DM Automation API (/api/dm-automation/*)', () => {
  const mockUser = { id: 'usr_dm_agent_1', email: 'dm@brand.com' };
  const businessId = 'biz_dm_suite_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/dm-automation/simulate', () => {
    it('rejects unauthenticated simulation requests with 401', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/dm-automation/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          messageText: 'What is your pricing?',
        }),
      });
      const res = await simulateDM(req);

      expect(res.status).toBe(401);
    });

    it('rejects invalid inputs with 400 Validation error', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });

      const req = new NextRequest('http://localhost:3000/api/dm-automation/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: '',
          messageText: '',
        }),
      });
      const res = await simulateDM(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it('simulates inbound DM and returns synthesized reply with intent', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({ id: businessId });
      (DMAutomationService.processIncomingDM as jest.Mock).mockResolvedValue({
        ruleMatched: true,
        ruleName: 'Pricing Inquiry',
        intent: 'PRICING',
        replyText: 'Our Pro plan is $99/mo.',
        confidenceScore: 94,
      });

      const req = new NextRequest('http://localhost:3000/api/dm-automation/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          platform: 'INSTAGRAM',
          senderName: 'Sarah Connor',
          messageText: 'Can you share your pricing options?',
        }),
      });
      const res = await simulateDM(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.reply.intent).toBe('PRICING');
      expect(json.reply.replyText).toContain('$99');
    });
  });

  describe('GET & POST /api/dm-automation/rules', () => {
    it('blocks unauthenticated access to rules with 401', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost:3000/api/dm-automation/rules?businessId=${businessId}`);
      const res = await getRules(req);

      expect(res.status).toBe(401);
    });

    it('blocks foreign tenant from reading rules with 403 Forbidden', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(`http://localhost:3000/api/dm-automation/rules?businessId=${businessId}`);
      const res = await getRules(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('Forbidden');
    });

    it('returns auto-reply rules for verified business member', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (DMAutomationService.getRules as jest.Mock).mockResolvedValue([
        { id: 'rule_1', name: 'Demo Request', platform: 'INSTAGRAM', triggerKeywords: ['demo', 'call'] },
      ]);

      const req = new NextRequest(`http://localhost:3000/api/dm-automation/rules?businessId=${businessId}`);
      const res = await getRules(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.rules.length).toBe(1);
      expect(json.rules[0].name).toBe('Demo Request');
    });

    it('blocks foreign tenant from saving a rule with 403 Forbidden', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/dm-automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          name: 'Unauthorized Rule',
          platform: 'TWITTER',
          triggerKeywords: ['test'],
          replyTemplate: 'Hello',
        }),
      });
      const res = await createRule(req);

      expect(res.status).toBe(403);
    });

    it('creates a new rule with 201 Created for verified member', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'mem_1',
        businessId,
        userId: mockUser.id,
      });
      (DMAutomationService.saveRule as jest.Mock).mockResolvedValue({
        id: 'rule_created_1',
        name: 'VIP Lead Capture',
        platform: 'INSTAGRAM',
        triggerKeywords: ['pricing', 'quote'],
        replyTemplate: 'Thanks for reaching out! Check our plans.',
      });

      const req = new NextRequest('http://localhost:3000/api/dm-automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          name: 'VIP Lead Capture',
          platform: 'INSTAGRAM',
          triggerKeywords: ['pricing', 'quote'],
          replyTemplate: 'Thanks for reaching out! Check our plans.',
        }),
      });
      const res = await createRule(req);

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.rule.id).toBe('rule_created_1');
    });
  });
});
