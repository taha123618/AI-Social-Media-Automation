import prisma from '@/lib/prisma';

export interface ConsistencyScore {
  overall: number; // 0-100
  frequency: number; // 0-100
  streak: number; // current streak in days
  optimalTiming: number; // 0-100
  recommendation: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface PostingAnalytics {
  totalPosts: number;
  averagePerWeek: number;
  bestDay: string;
  bestTime: number;
  consistencyScore: ConsistencyScore;
}

/**
 * Industry-specific optimal posting frequencies (posts per week)
 */
const OPTIMAL_FREQUENCY: Record<string, number> = {
  RESTAURANT: 5,
  SALON: 4,
  BEAUTY_COSMETICS: 5,
  CONTRACTOR: 3,
  HOME_SERVICES: 3,
  AUTO_REPAIR: 3,
  RETAIL: 5,
  HEALTH_FITNESS: 5,
  REAL_ESTATE: 4,
  LEGAL_FINANCIAL: 3,
  MEDICAL_DENTAL: 3,
  EDUCATION: 4,
  PET_SERVICES: 5,
  PHOTOGRAPHY: 4,
  EVENT_SERVICES: 4,
  PERSONAL_SERVICES: 4,
  OTHER: 3
};

/**
 * Calculate consistency score for a business
 */
export async function calculateConsistencyScore(
  businessId: string,
  days = 90
): Promise<ConsistencyScore> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get business industry
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { profile: true }
  });

  if (!business) {
    throw new Error('Business not found');
  }

  const industry = business.businessType || 'OTHER';
  const optimalPerWeek = OPTIMAL_FREQUENCY[industry] || 3;

  // Get all posts in the period
  const posts = await prisma.post.findMany({
    where: {
      businessId,
      postedAt: {
        gte: startDate
      }
    },
    orderBy: { postedAt: 'desc' }
  });

  // Filter out posts with null postedAt to satisfy PostWithDate interface
  const validPosts = posts.filter((p): p is typeof p & { postedAt: Date } => p.postedAt !== null);

  // Calculate frequency score
  const frequencyScore = calculateFrequencyScore(validPosts, optimalPerWeek, days);

  // Calculate current streak
  const currentStreak = calculatePostingStreak(validPosts);

  // Calculate streak score (exponential reward for longer streaks)
  const streakScore = Math.min(100, Math.pow(currentStreak, 2) * 2);

  // Calculate optimal timing score
  const timingScore = await calculateOptimalTimingScore(businessId, validPosts);

  // Overall score (weighted average)
  const overall = Math.round(
    frequencyScore * 0.5 + // 50% weight on frequency
    streakScore * 0.3 +    // 30% weight on streak
    timingScore * 0.2      // 20% weight on timing
  );

  // Determine trend
  const trend = calculateTrend(validPosts, optimalPerWeek);

  // Generate recommendation
  const recommendation = generateRecommendation(overall, frequencyScore, streakScore, timingScore);

  return {
    overall,
    frequency: frequencyScore,
    streak: currentStreak,
    optimalTiming: timingScore,
    recommendation,
    trend
  };
}

interface PostWithDate {
  id: string;
  postedAt: Date | string;
}

/**
 * Calculate frequency score (0-100)
 */
function calculateFrequencyScore(
  posts: PostWithDate[],
  optimalPerWeek: number,
  days: number
): number {
  const weeks = days / 7;
  const actualPerWeek = posts.length / weeks;

  // Score based on how close to optimal
  const ratio = actualPerWeek / optimalPerWeek;

  if (ratio >= 1) {
    // Meeting or exceeding optimal
    return Math.min(100, 80 + (ratio - 1) * 20);
  } else if (ratio >= 0.7) {
    // Close to optimal (70-100%)
    return 60 + (ratio - 0.7) * 50;
  } else if (ratio >= 0.4) {
    // Moderate (40-70%)
    return 30 + (ratio - 0.4) * 100;
  } else {
    // Poor (<40%)
    return ratio * 75;
  }
}

/**
 * Calculate current posting streak in days
 */
function calculatePostingStreak(posts: PostWithDate[]): number {
  if (posts.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort posts by date
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );

  let streak = 0;
  const currentDate = today;

  // Check if posted today or yesterday
  const mostRecentPost = new Date(sortedPosts[0].postedAt);
  mostRecentPost.setHours(0, 0, 0, 0);

  const daysSinceLastPost = Math.floor(
    (today.getTime() - mostRecentPost.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastPost > 1) {
    return 0; // Streak broken
  }

  // Count consecutive days with posts
  const postDates = new Set(
    sortedPosts.map((p: PostWithDate) => {
      const d = new Date(p.postedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  while (postDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Calculate optimal timing score
 */
async function calculateOptimalTimingScore(
  businessId: string,
  posts: PostWithDate[]
): Promise<number> {
  if (posts.length === 0) return 0;

  // Analyze which days/times get best engagement
  const engagementByHour: Record<number, number> = {};
  const engagementByDay: Record<number, number> = {};

  for (const post of posts) {
    const totalEngagement =
      (post as any).likes +
      (post as any).comments +
      (post as any).shares +
      (post as any).clicks;

    const date = new Date(post.postedAt);
    const hour = date.getHours();
    const day = date.getDay();

    engagementByHour[hour] = (engagementByHour[hour] || 0) + totalEngagement;
    engagementByDay[day] = (engagementByDay[day] || 0) + totalEngagement;
  }

  // Find best performing hour and day
  const bestHour = Object.entries(engagementByHour)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const bestDay = Object.entries(engagementByDay)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Calculate what percentage of posts are at optimal times
  let optimalPosts = 0;
  for (const post of posts) {
    const date = new Date(post.postedAt);
    if (date.getHours() === parseInt(bestHour) &&
        date.getDay() === parseInt(bestDay)) {
      optimalPosts++;
    }
  }

  return posts.length > 0 ? Math.round((optimalPosts / posts.length) * 100) : 0;
}

/**
 * Calculate trend (improving, stable, declining)
 */
function calculateTrend(posts: PostWithDate[], optimalPerWeek: number): 'improving' | 'stable' | 'declining' {
  if (posts.length < 10) return 'stable';

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentPosts = posts.filter((p: PostWithDate) => new Date(p.postedAt) >= thirtyDaysAgo);
  const olderPosts = posts.filter((p: PostWithDate) =>
    new Date(p.postedAt) >= sixtyDaysAgo && new Date(p.postedAt) < thirtyDaysAgo
  );

  const recentPerWeek = recentPosts.length / (30 / 7);
  const olderPerWeek = olderPosts.length / (30 / 7);

  const change = recentPerWeek - olderPerWeek;

  if (change >= optimalPerWeek * 0.2) {
    return 'improving';
  } else if (change <= -optimalPerWeek * 0.2) {
    return 'declining';
  } else {
    return 'stable';
  }
}

/**
 * Generate actionable recommendation
 */
function generateRecommendation(
  overall: number,
  frequency: number,
  streak: number,
  timing: number
): string {
  if (overall >= 80) {
    return "Excellent! You're posting consistently at optimal times. Keep it up! 🎉";
  } else if (overall >= 60) {
    if (frequency < 60) {
      return "Good progress! Try to post 1-2 more times per week to maximize reach. 📈";
    } else if (streak < 7) {
      return "You're doing well! Focus on maintaining a daily streak for better algorithm performance. 🔥";
    } else {
      return "Great consistency! Experiment with different posting times to boost engagement. ⏰";
    }
  } else if (overall >= 40) {
    if (frequency < 40) {
      return "Let's increase your posting frequency. Aim for at least 3 posts per week to stay visible. 📅";
    } else if (timing < 40) {
      return "You're posting regularly, but try analyzing your best-performing posts to find optimal times. 🎯";
    } else {
      return "Building momentum! Focus on maintaining a consistent daily streak. 💪";
    }
  } else {
    return "Let's start fresh! Commit to posting at least 2-3 times per week on consistent days. 🚀";
  }
}

/**
 * Get comprehensive posting analytics
 */
export async function getPostingAnalytics(businessId: string): Promise<PostingAnalytics> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { profile: true }
  });

  if (!business) {
    throw new Error('Business not found');
  }

  const posts = await prisma.post.findMany({
    where: { businessId },
    orderBy: { postedAt: 'desc' },
    take: 100
  });

  // Filter out posts with null postedAt
  const validPosts = posts.filter((p): p is typeof p & { postedAt: Date } => p.postedAt !== null);

  const consistencyScore = await calculateConsistencyScore(businessId, 90);

  // Calculate basic stats
  const totalPosts = validPosts.length;
  const oldestPost = validPosts[validPosts.length - 1];
  const daysActive = oldestPost
    ? Math.ceil((new Date().getTime() - new Date(oldestPost.postedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const averagePerWeek = daysActive > 0 ? (totalPosts / daysActive) * 7 : 0;

  // Find best performing day/time
  const engagementByDay: Record<number, number> = {};
  const engagementByHour: Record<number, number> = {};

  for (const post of validPosts) {
    const totalEngagement = (post as any).likes + (post as any).comments + (post as any).shares;
    const date = new Date(post.postedAt);
    const day = date.getDay();
    const hour = date.getHours();

    engagementByDay[day] = (engagementByDay[day] || 0) + totalEngagement;
    engagementByHour[hour] = (engagementByHour[hour] || 0) + totalEngagement;
  }

  const bestDayNum = Object.entries(engagementByDay)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const bestHourNum = Object.entries(engagementByHour)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDay = bestDayNum !== undefined ? dayNames[parseInt(bestDayNum)] : 'N/A';
  const bestTime = bestHourNum !== undefined ? parseInt(bestHourNum) : 12;

  return {
    totalPosts,
    averagePerWeek: Math.round(averagePerWeek * 10) / 10,
    bestDay,
    bestTime,
    consistencyScore
  };
}
