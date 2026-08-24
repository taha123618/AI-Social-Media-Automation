import prisma from '@/lib/prisma';

export interface RevenueAttribution {
  totalRevenue: number;
  attributedRevenue: number;
  attributionRate: number;
  roi: number;
  revenueByPost: Array<{
    postId: string;
    revenue: number;
    leads: number;
    conversionRate: number;
  }>;
  revenueByLeadType: Record<string, number>;
  averageCustomerValue: number;
  projectedAnnualRevenue: number;
}

export interface CustomerJourney {
  touchpoints: number;
  firstTouchPostId?: string;
  lastTouchPostId?: string;
  journeyDays: number;
  attributedValue: number;
}

/**
 * Industry-specific customer lifetime values
 */
const INDUSTRY_CLV: Record<string, number> = {
  RESTAURANT: 500,        // Average customer value per year
  SALON: 800,             // Regular appointments
  BEAUTY_COSMETICS: 600,
  CONTRACTOR: 2500,       // High-value projects
  HOME_SERVICES: 1500,
  AUTO_REPAIR: 1200,
  RETAIL: 400,
  HEALTH_FITNESS: 900,    // Gym memberships, etc.
  REAL_ESTATE: 15000,     // Commission-based
  LEGAL_FINANCIAL: 3000,
  MEDICAL_DENTAL: 2000,
  EDUCATION: 1500,
  PET_SERVICES: 700,
  PHOTOGRAPHY: 1000,
  EVENT_SERVICES: 2000,
  PERSONAL_SERVICES: 800,
  OTHER: 500
};

/**
 * Calculate revenue attribution for a business
 */
export async function calculateRevenueAttribution(
  businessId: string,
  days = 90
): Promise<RevenueAttribution> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get business info
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { profile: true }
  });

  if (!business) {
    throw new Error('Business not found');
  }

  const industry = business.businessType || 'OTHER';
  const avgCustomerValue = INDUSTRY_CLV[industry] || 500;

  // Get all posts in period (now flattened)
  const posts = await prisma.post.findMany({
    where: {
      businessId,
      postedAt: {
        gte: startDate
      }
    }
  });

  // Get all leads in period
  const leads = await prisma.lead.findMany({
    where: {
      businessId,
      createdAt: {
        gte: startDate
      }
    }
  });

  // Calculate attributed revenue from leads
  let attributedRevenue = 0;
  const revenueByLeadType: Record<string, number> = {};

  for (const lead of leads) {
    const leadValue = lead.estimatedValue || 25;
    attributedRevenue += leadValue;

    const typeKey = lead.leadType;
    revenueByLeadType[typeKey] = (revenueByLeadType[typeKey] || 0) + leadValue;
  }

  // Calculate revenue by post (based on lead attribution)
  const revenueByPostMap = new Map<string, { revenue: number; leads: number }>();

  for (const lead of leads) {
    if (lead.postId) {
      const existing = revenueByPostMap.get(lead.postId) || { revenue: 0, leads: 0 };
      existing.revenue += lead.estimatedValue || 25;
      existing.leads += 1;
      revenueByPostMap.set(lead.postId, existing);
    }
  }

  const revenueByPost = Array.from(revenueByPostMap.entries()).map(([postId, data]) => {
    const post = posts.find(p => p.id === postId);
    const impressions = post?.impressions || 1;
    return {
      postId,
      revenue: data.revenue,
      leads: data.leads,
      conversionRate: (data.leads / impressions) * 100
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Total estimated revenue (not just attributed)
  const totalRevenue = attributedRevenue * 1.5; // Assume we're missing ~33% of attribution

  // Calculate ROI (assuming social media investment)
  const estimatedSocialSpend = 500; // Base assumption: $500/month in time/tools
  const roi = ((attributedRevenue - estimatedSocialSpend) / estimatedSocialSpend) * 100;

  // Attribution rate
  const attributionRate = posts.length > 0
    ? (revenueByPost.length / posts.length) * 100
    : 0;

  // Project annual revenue
  const monthlyRunRate = attributedRevenue / (days / 30);
  const projectedAnnualRevenue = monthlyRunRate * 12;

  return {
    totalRevenue,
    attributedRevenue: Math.round(attributedRevenue),
    attributionRate: Math.round(attributionRate),
    roi: Math.round(roi),
    revenueByPost,
    revenueByLeadType,
    averageCustomerValue: avgCustomerValue,
    projectedAnnualRevenue: Math.round(projectedAnnualRevenue)
  };
}

/**
 * Track customer journey across multiple touchpoints
 */
export async function trackCustomerJourney(
  customerId: string,
  businessId: string
): Promise<CustomerJourney> {
  // Get all interactions for this customer
  const leads = await prisma.lead.findMany({
    where: {
      businessId,
      metadata: {
        path: ['customerId'],
        equals: customerId
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const touchpoints = leads.length;

  if (touchpoints === 0) {
    return {
      touchpoints: 0,
      journeyDays: 0,
      attributedValue: 0
    };
  }

  const firstTouch = leads[0];
  const lastTouch = leads[leads.length - 1];

  const journeyDays = Math.floor(
    (lastTouch.createdAt.getTime() - firstTouch.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const attributedValue = leads.reduce((sum: number, lead: any) =>
    sum + (lead.estimatedValue || 0), 0
  );

  return {
    touchpoints,
    firstTouchPostId: firstTouch.postId || undefined,
    lastTouchPostId: lastTouch.postId || undefined,
    journeyDays,
    attributedValue
  };
}

/**
 * Calculate multi-touch attribution model
 */
export async function calculateMultiTouchAttribution(
  businessId: string,
  days = 90
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const leads = await prisma.lead.findMany({
    where: {
      businessId,
      createdAt: {
        gte: startDate
      },
      postId: {
        not: null
      }
    },
    include: {
      post: true
    }
  });

  // Group by post and calculate position-based weight
  const postAttribution = new Map<string, { weighted: number; count: number }>();

  for (const lead of leads) {
    if (!lead.postId) continue;

    // Simple linear model: equal weight to all touchpoints
    const weight = 1 / (leads.filter((l: any) => l.postId === lead.postId).length);
    const value = (lead.estimatedValue || 0) * weight;

    const existing = postAttribution.get(lead.postId) || { weighted: 0, count: 0 };
    existing.weighted += value;
    existing.count += 1;
    postAttribution.set(lead.postId, existing);
  }

  return Array.from(postAttribution.entries()).map(([postId, data]) => ({
    postId,
    attributedRevenue: Math.round(data.weighted),
    assistedConversions: data.count
  })).sort((a, b) => b.attributedRevenue - a.attributedRevenue);
}

/**
 * Get ROI comparison across different channels
 */
export async function getChannelROI(businessId: string, days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const leads = await prisma.lead.findMany({
    where: {
      businessId,
      createdAt: {
        gte: startDate
      }
    }
  });

  // Group by source
  const channelStats: Record<string, { revenue: number; leads: number; cost: number }> = {};

  for (const lead of leads) {
    const source = lead.source || 'SOCIAL_MEDIA';
    if (!channelStats[source]) {
      channelStats[source] = { revenue: 0, leads: 0, cost: 0 };
    }
    channelStats[source].revenue += lead.estimatedValue || 0;
    channelStats[source].leads += 1;
  }

  // Add estimated costs (you would customize this based on actual spend)
  channelStats['SOCIAL_MEDIA'].cost = 500; // $500/month
  channelStats['GOOGLE_ADS'] = channelStats['GOOGLE_ADS'] || { revenue: 0, leads: 0, cost: 1000 };
  channelStats['EMAIL'] = channelStats['EMAIL'] || { revenue: 0, leads: 0, cost: 100 };

  // Calculate ROI for each channel
  return Object.entries(channelStats).map(([channel, data]) => ({
    channel,
    revenue: Math.round(data.revenue),
    leads: data.leads,
    cost: data.cost,
    roi: Math.round(((data.revenue - data.cost) / data.cost) * 100),
    costPerLead: data.leads > 0 ? Math.round(data.cost / data.leads) : 0
  }));
}
