import { calculateConsistencyScore } from '../consistency-scorer.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    business: {
      findUnique: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
  },
  prisma: {
    business: {
      findUnique: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
  },
}));

describe('ConsistencyScorerService', () => {
  const businessId = 'biz_restaurant_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates 0-100 score and returns high score for regular posting schedule', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: businessId,
      profile: { industry: 'RESTAURANT' },
    });

    const now = new Date();
    // Simulate 30 posts over the last 60 days
    const mockPosts = Array.from({ length: 30 }).map((_, i) => ({
      id: `post_${i}`,
      publishedAt: new Date(now.getTime() - i * 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - i * 2 * 24 * 60 * 60 * 1000),
    }));

    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

    const score = await calculateConsistencyScore(businessId, 60);

    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.frequency).toBeGreaterThan(0);
    expect(['improving', 'stable', 'declining']).toContain(score.trend);
    expect(typeof score.recommendation).toBe('string');
  });

  it('throws an error if business is not found', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(calculateConsistencyScore('invalid_biz')).rejects.toThrow('Business not found');
  });

  it('handles empty post history gracefully with low score', async () => {
    (prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: businessId,
      profile: { industry: 'RESTAURANT' },
    });

    (prisma.post.findMany as jest.Mock).mockResolvedValue([]);

    const score = await calculateConsistencyScore(businessId, 30);

    expect(score.overall).toBeLessThanOrEqual(50);
    expect(score.streak).toBe(0);
  });
});
