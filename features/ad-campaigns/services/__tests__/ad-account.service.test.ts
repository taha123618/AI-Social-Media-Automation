import AdAccountService from '../ad-account.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const adAccount = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  };
  const platformCredential = {
    findFirst: jest.fn(),
  };
  const thirdPartyService = {
    findFirst: jest.fn(),
  };
  const client = { adAccount, platformCredential, thirdPartyService };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    adAccount,
    platformCredential,
    thirdPartyService,
  };
});

describe('AdAccountService', () => {
  afterEach(() => jest.clearAllMocks());

  it('creates an ad account', async () => {
    (prisma.adAccount.create as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });

    const res = await AdAccountService.createAdAccount('b1', 'META', 'Test', 'act_123');
    expect(res).toEqual({ id: '1', name: 'Test' });
    expect(prisma.adAccount.create).toHaveBeenCalledWith({ data: { businessId: 'b1', platform: 'META', name: 'Test', platformAccountId: 'act_123' } });
  });

  it('sets primary account', async () => {
    (prisma.adAccount.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.adAccount.update as jest.Mock).mockResolvedValue({ id: 'a1', isPrimary: true });

    const res = await AdAccountService.setPrimaryAccount('b1', 'a1');
    expect(prisma.adAccount.updateMany).toHaveBeenCalledWith({ where: { businessId: 'b1' }, data: { isPrimary: false } });
    expect(prisma.adAccount.update).toHaveBeenCalledWith({ where: { id: 'a1' }, data: { isPrimary: true } });
    expect(res).toEqual({ id: 'a1', isPrimary: true });
  });
});
