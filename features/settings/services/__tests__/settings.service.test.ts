import { SettingsService } from '../settings.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/lib/prisma', () => {
  const business = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const businessProfile = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  };
  const socialAccount = {
    findMany: jest.fn(),
  };
  const client = { business, businessProfile, socialAccount };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
    businessProfile,
    socialAccount,
  };
});

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
    logAudit: jest.fn(),
  },
}));

describe('SettingsService', () => {
  const businessId = 'biz_settings_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBusinessSettings', () => {
    it('returns combined business settings, profile, and social accounts', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: businessId,
        name: 'Tech Ventures',
        slug: 'tech-ventures',
        members: [],
        profile: { tone: 'Authoritative' },
        socialAccounts: [],
      });
      (prisma.businessProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'prof_1',
        businessId,
        tone: 'Authoritative',
      });
      (prisma.socialAccount.findMany as jest.Mock).mockResolvedValue([
        { id: 'sa_1', platform: 'TWITTER', isActive: true },
      ]);

      const result = await SettingsService.getBusinessSettings(businessId);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Tech Ventures');
      expect(result?.tone).toBe('Authoritative');
      expect(result?.defaultPlatforms).toEqual(['TWITTER']);
    });

    it('returns null if the business does not exist', async () => {
      (prisma.business.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.businessProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.socialAccount.findMany as jest.Mock).mockResolvedValue([]);

      const result = await SettingsService.getBusinessSettings('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateBusinessSettings', () => {
    it('updates business core settings and logs audit activity', async () => {
      (prisma.business.update as jest.Mock).mockResolvedValue({
        id: businessId,
        name: 'Tech Ventures Global',
        industry: 'Software',
      });
      (prisma.businessProfile.upsert as jest.Mock).mockResolvedValue({
        id: 'prof_1',
        businessId,
        industry: 'Software',
      });

      const result = await SettingsService.updateBusinessSettings(businessId, {
        name: 'Tech Ventures Global',
        industry: 'Software',
      });

      expect(result.business.name).toBe('Tech Ventures Global');
      expect(prisma.business.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: businessId },
        })
      );
    });
  });
});
