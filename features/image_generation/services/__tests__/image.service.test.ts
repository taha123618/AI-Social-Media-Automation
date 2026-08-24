import { ImageService } from '../image.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    businessProfile: {
      findUnique: jest.fn(),
    },
  },
  prisma: {
    businessProfile: {
      findUnique: jest.fn(),
    },
  },
}));

describe('ImageService', () => {
  describe('getAIModels', () => {
    it('returns supported AI model registry dictionary', () => {
      const models = ImageService.getAIModels();
      expect(models).toBeDefined();
      expect(typeof models).toBe('object');
    });
  });

  describe('getImageTypes', () => {
    it('returns supported image type configurations', () => {
      const imageTypes = ImageService.getImageTypes();
      expect(imageTypes).toBeDefined();
      expect(typeof imageTypes).toBe('object');
    });
  });

  describe('applyBrandFilters', () => {
    const businessId = 'biz_brand_filter_test';
    const sampleUrl = 'https://example.com/generated-image.jpg';

    it('returns original image url if brand profile is not found', async () => {
      (prisma.businessProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await ImageService.applyBrandFilters(businessId, sampleUrl);
      expect(result).toBe(sampleUrl);
    });

    it('appends watermark and brand parameters to URL if brand profile exists', async () => {
      (prisma.businessProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'prof_1',
        businessId,
        watermark: 'acme_watermark.png',
        colorPalette: ['#2e42ff', '#ffffff'],
      });

      const result = await ImageService.applyBrandFilters(businessId, sampleUrl, {
        addWatermark: true,
        applyColorGrade: true,
        resizeForPlatform: 'instagram',
      });

      expect(result).toContain('branded=true');
      expect(result).toContain(`bid=${businessId}`);
      expect(result).toContain('wm=acme_watermark.png');
      expect(result).toContain('target=instagram');
    });
  });
});
