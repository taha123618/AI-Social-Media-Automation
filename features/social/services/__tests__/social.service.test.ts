import { SocialMediaService } from '../social.service';
import { Platform } from '@/types';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/lib/prisma', () => {
  const socialAccount = {
    findFirst: jest.fn(),
  };
  const thirdPartyService = {
    findFirst: jest.fn(),
  };
  const post = {
    create: jest.fn(),
  };
  const client = { socialAccount, thirdPartyService, post };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    socialAccount,
    thirdPartyService,
    post,
  };
});

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

describe('SocialMediaService', () => {
  const businessId = 'biz_social_test_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if no connected active social account exists for platform', async () => {
    (prisma.socialAccount.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.thirdPartyService.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      SocialMediaService.publishInfo(businessId, Platform.LINKEDIN, 'Test LinkedIn Post')
    ).rejects.toThrow('No connected account found for LINKEDIN');
  });

  it('logs activity when starting social post publishing and returns post results', async () => {
    (prisma.socialAccount.findFirst as jest.Mock).mockResolvedValue({
      id: 'acc_1',
      businessId,
      platform: 'LINKEDIN',
      accessToken: 'mock_token',
      platformId: 'urn:li:person:123',
    });
    (prisma.thirdPartyService.findFirst as jest.Mock).mockResolvedValue({
      id: 'srv_1',
      businessId,
      platform: 'LINKEDIN',
      apiKey: 'key',
    });

    const mockProvider = (SocialMediaService as any).providers.get(Platform.LINKEDIN);
    if (mockProvider) {
      jest.spyOn(mockProvider, 'postContent').mockResolvedValue({
        postId: 'post_remote_123',
        platformUrl: 'https://linkedin.com/feed/update/123',
      });
    }

    const result = await SocialMediaService.publishInfo(
      businessId,
      Platform.LINKEDIN,
      'Announcing our exciting new product launch!'
    );

    expect(result.postId).toBe('post_remote_123');
    expect(SystemLogger.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SOCIAL_POST_STARTED',
      })
    );
  });
});
