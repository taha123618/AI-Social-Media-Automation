import { convertReviewToPostDraft } from '../review-to-post-converter.service';
import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';
import { Platform } from '@/app/generated/prisma/enums';

jest.mock('@/lib/prisma', () => {
  const review = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const contentDraft = {
    create: jest.fn(),
  };
  const client = { review, contentDraft };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    review,
    contentDraft,
  };
});

jest.mock('@/services/ai/ai.service', () => ({
  AIService: {
    generateJSON: jest.fn(),
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

describe('convertReviewToPostDraft', () => {
  const reviewId = 'rev_123';
  const businessId = 'biz_boost_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects converting reviews with low ratings (< 4 stars)', async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: reviewId,
      rating: 2,
      reviewText: 'Mediocre experience.',
      reviewerName: 'Bob',
      business: {
        id: businessId,
        name: 'Burger Joint',
        profile: null,
        members: [{ userId: 'u1' }],
      },
    });

    await expect(
      convertReviewToPostDraft({ reviewId, businessId, platforms: [Platform.INSTAGRAM] })
    ).rejects.toThrow('Only positive reviews (4+ stars) can be converted to posts');
  });

  it('converts 5-star review into social post draft using AIService', async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: reviewId,
      rating: 5,
      reviewText: 'Best customer service ever! The team was super fast.',
      reviewerName: 'Sarah Connor',
      business: {
        id: businessId,
        name: 'Cyber Solutions',
        profile: {
          industry: 'Technology',
          tone: 'Friendly & Bold',
          mission: 'Empowering future tech',
        },
        members: [{ userId: 'u1' }],
      },
    });
    (prisma.review.update as jest.Mock).mockResolvedValue({});
    (prisma.contentDraft.create as jest.Mock).mockResolvedValue({ id: 'draft_from_rev_1' });

    (AIService.generateJSON as jest.Mock).mockResolvedValue({
      caption: 'We love hearing from happy clients! "Best customer service ever!" ⭐⭐⭐⭐⭐',
      hashtags: ['#CustomerLove', '#FiveStars', '#TechExcellence'],
      cta: 'Book your free discovery call today!',
      suggestedMedia: ['client-quote-graphic'],
    });

    const result = await convertReviewToPostDraft({
      reviewId,
      businessId,
      platforms: [Platform.INSTAGRAM, Platform.LINKEDIN],
    });

    expect(result.caption).toContain('⭐⭐⭐⭐⭐');
    expect(result.hashtags).toHaveLength(3);
    expect(result.platforms).toEqual([Platform.INSTAGRAM, Platform.LINKEDIN]);
    expect(AIService.generateJSON).toHaveBeenCalled();
  });
});
