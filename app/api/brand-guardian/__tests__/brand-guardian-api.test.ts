import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => {
  const businessMember = {
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

jest.mock('@/features/brand_guardian/services/brand-guardian.service', () => ({
  BrandGuardianService: {
    auditCopy: jest.fn(),
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logError: jest.fn(),
  },
}));

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BrandGuardianService } from '@/features/brand_guardian/services/brand-guardian.service';
import { POST } from '../audit/route';

describe('Brand Guardian Audit API (/api/brand-guardian/audit)', () => {
  const mockUser = { id: 'usr_bg_1', email: 'brand@guardian.ai' };
  const businessId = 'biz_guardian_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/brand-guardian/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, text: 'Announcing our new product.' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('rejects non-member requests with 403 Forbidden', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/brand-guardian/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, text: 'Announcing our new product.' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('access');
  });

  it('rejects invalid inputs with 400 Validation Error when text is missing', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });

    const req = new NextRequest('http://localhost:3000/api/brand-guardian/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, text: '' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('successfully audits compliant copy and returns A+ report', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
      id: 'mem_1',
      businessId,
      userId: mockUser.id,
    });
    (BrandGuardianService.auditCopy as jest.Mock).mockResolvedValue({
      overallScore: 98,
      grade: 'A+',
      isCompliant: true,
      violations: [],
      suggestions: ['Add a call to action at the end.'],
    });

    const req = new NextRequest('http://localhost:3000/api/brand-guardian/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        text: 'Join our enterprise webinar next Tuesday.',
        platform: 'LINKEDIN',
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.result.grade).toBe('A+');
    expect(json.result.isCompliant).toBe(true);
  });

  it('detects brand violations and returns non-compliant grading', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
      id: 'mem_1',
      businessId,
      userId: mockUser.id,
    });
    (BrandGuardianService.auditCopy as jest.Mock).mockResolvedValue({
      overallScore: 65,
      grade: 'D',
      isCompliant: false,
      violations: [
        { type: 'FORBIDDEN_WORD', term: 'cheap', fix: 'affordable' },
      ],
      suggestions: ['Remove forbidden buzzwords.'],
    });

    const req = new NextRequest('http://localhost:3000/api/brand-guardian/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        text: 'Our cheap software will disrupt your industry.',
        platform: 'TWITTER',
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.isCompliant).toBe(false);
    expect(json.result.violations.length).toBe(1);
    expect(json.result.violations[0].term).toBe('cheap');
  });
});
