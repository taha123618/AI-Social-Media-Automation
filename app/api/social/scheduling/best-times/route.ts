import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Industry default best-time recommendations (fallback when insufficient data)
const INDUSTRY_DEFAULTS: Record<string, Array<{ day: number; hour: number; score: number }>> = {
  RESTAURANT: [
    { day: 5, hour: 17, score: 92 }, // Friday 5pm
    { day: 0, hour: 11, score: 88 }, // Sunday 11am brunch
    { day: 3, hour: 12, score: 82 }, // Wednesday noon
    { day: 6, hour: 10, score: 79 }, // Saturday 10am
    { day: 2, hour: 18, score: 74 }, // Tuesday 6pm
  ],
  SALON: [
    { day: 1, hour: 9, score: 91 },  // Monday morning booking rush
    { day: 4, hour: 14, score: 87 }, // Thursday afternoon
    { day: 6, hour: 9, score: 85 },  // Saturday morning
    { day: 2, hour: 11, score: 78 }, // Tuesday mid-morning
    { day: 0, hour: 15, score: 72 }, // Sunday afternoon
  ],
  DEFAULT: [
    { day: 2, hour: 9, score: 88 },  // Tuesday 9am
    { day: 4, hour: 9, score: 85 },  // Thursday 9am
    { day: 3, hour: 12, score: 82 }, // Wednesday noon
    { day: 1, hour: 17, score: 78 }, // Monday 5pm
    { day: 5, hour: 10, score: 74 }, // Friday 10am
  ],
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id') || req.nextUrl.searchParams.get('businessId');
    if (!businessId) return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });

    const member = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: session.user.id, businessId } }
    });
    if (!member) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });

    // Fetch real post performance data
    const posts = await prisma.post.findMany({
      where: { businessId, postedAt: { not: null } },
      select: { postedAt: true, likes: true, comments: true, reach: true, shares: true },
      orderBy: { postedAt: 'desc' },
      take: 200,
    });

    let recommendations: Array<{
      day: number; dayName: string; hour: number; label: string; score: number; dataSource: string;
    }>;

    if (posts.length >= 10) {
      // Real analytics: group by day-of-week + hour, sum engagement
      const buckets: Record<string, { totalEngagement: number; count: number }> = {};

      for (const post of posts) {
        if (!post.postedAt) continue;
        const date = new Date(post.postedAt);
        const key = `${date.getDay()}-${date.getHours()}`;
        const engagement = (post.likes || 0) + (post.comments || 0) * 3 + (post.shares || 0) * 5;
        if (!buckets[key]) buckets[key] = { totalEngagement: 0, count: 0 };
        buckets[key].totalEngagement += engagement;
        buckets[key].count += 1;
      }

      // Calculate average engagement per slot and find max for normalization
      const slotAverages = Object.entries(buckets)
        .map(([key, { totalEngagement, count }]) => {
          const [day, hour] = key.split('-').map(Number);
          return { day, hour, avgEngagement: totalEngagement / count, count };
        })
        .filter(s => s.count >= 2)
        .sort((a, b) => b.avgEngagement - a.avgEngagement);

      const maxEngagement = slotAverages[0]?.avgEngagement || 1;

      recommendations = slotAverages.slice(0, 7).map(slot => ({
        day: slot.day,
        dayName: DAY_NAMES[slot.day],
        hour: slot.hour,
        label: `${slot.hour === 0 ? 12 : slot.hour > 12 ? slot.hour - 12 : slot.hour}:00 ${slot.hour >= 12 ? 'PM' : 'AM'}`,
        score: Math.round((slot.avgEngagement / maxEngagement) * 100),
        dataSource: 'analytics',
      }));
    } else {
      // Fall back to industry defaults
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      const profile = await prisma.businessProfile.findUnique({ where: { businessId } });
      const industry = profile?.industry || business?.businessType || 'DEFAULT';
      const defaults = INDUSTRY_DEFAULTS[industry] || INDUSTRY_DEFAULTS.DEFAULT;

      recommendations = defaults.map(slot => ({
        day: slot.day,
        dayName: DAY_NAMES[slot.day],
        hour: slot.hour,
        label: `${slot.hour === 0 ? 12 : slot.hour > 12 ? slot.hour - 12 : slot.hour}:00 ${slot.hour >= 12 ? 'PM' : 'AM'}`,
        score: slot.score,
        dataSource: 'industry_average',
      }));
    }

    // Build heatmap data: 7 days × 24 hours with relative scores
    const heatmap: Array<{ day: number; hour: number; score: number }> = [];
    const recMap = new Map(recommendations.map(r => [`${r.day}-${r.hour}`, r.score]));

    for (let day = 0; day < 7; day++) {
      for (let hour = 6; hour < 23; hour++) {
        heatmap.push({ day, hour, score: recMap.get(`${day}-${hour}`) || 0 });
      }
    }

    return NextResponse.json({
      success: true,
      recommendations,
      heatmap,
      postsAnalyzed: posts.length,
      dataSource: posts.length >= 10 ? 'analytics' : 'industry_average',
    });
  } catch (error: any) {
    console.error('[Best Times Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
