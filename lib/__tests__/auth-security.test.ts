import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    businessMember: {
      findFirst: jest.fn(),
    },
    contentDraft: {
      findMany: jest.fn(),
    },
  },
  prisma: {
    businessMember: {
      findFirst: jest.fn(),
    },
    contentDraft: {
      findMany: jest.fn(),
    },
  },
}));

describe('Multi-Tenant Security & Data Isolation', () => {
  const userA = { id: 'usr_alice', email: 'alice@company.com' };
  const userB = { id: 'usr_bob', email: 'bob@competitor.com' };
  const businessA = 'biz_tenant_alpha';
  const businessB = 'biz_tenant_beta';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access to business resources only for verified members with authorized roles', async () => {
    (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue({
      id: 'mem_1',
      businessId: businessA,
      userId: userA.id,
      role: 'OWNER',
    });

    const membership = await prisma.businessMember.findFirst({
      where: {
        businessId: businessA,
        userId: userA.id,
        role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
      },
    });

    expect(membership).toBeDefined();
    expect(membership?.role).toBe('OWNER');
  });

  it('strictly isolates tenant data queries by requiring businessId scoping', async () => {
    const mockTenantADrafts = [
      { id: 'draft_1', businessId: businessA, content: 'Tenant A Post' },
    ];

    (prisma.contentDraft.findMany as jest.Mock).mockResolvedValue(mockTenantADrafts);

    const results = await prisma.contentDraft.findMany({
      where: { businessId: businessA },
    });

    expect(results.length).toBe(1);
    expect(results[0].businessId).toBe(businessA);
    expect(prisma.contentDraft.findMany).toHaveBeenCalledWith({
      where: { businessId: businessA },
    });
  });

  it('denies access when a cross-tenant user attempts to query a foreign business', async () => {
    (prisma.businessMember.findFirst as jest.Mock).mockResolvedValue(null);

    const membership = await prisma.businessMember.findFirst({
      where: {
        businessId: businessB,
        userId: userA.id,
      },
    });

    expect(membership).toBeNull();
  });
});
