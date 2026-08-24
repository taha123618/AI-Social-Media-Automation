import prisma from '@/lib/prisma';

export interface LeadTrackingInput {
  postId: string;
  businessId: string;
  leadType: 'PHONE_CALL' | 'MESSAGE' | 'WEBSITE_VISIT' | 'BOOKING' | 'DIRECTIONS';
  metadata?: {
    source?: string;
    campaign?: string;
    value?: number;
  };
}

export interface LeadSummary {
  totalLeads: number;
  byType: Record<string, number>;
  estimatedValue: number;
  topPerformingPosts: Array<{
    postId: string;
    leads: number;
    value: number;
    title: string;
    platform: string;
    postedAt: Date;
  }>;
}

/**
 * Track a lead generated from a social media post
 */
export async function trackLead(input: LeadTrackingInput) {
  const { postId, businessId, leadType, metadata } = input;

  try {
    // Update Post with the lead (flattened fields)
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        [getLeadField(leadType)]: { increment: 1 }
      }
    });

    // Optionally create a Lead record for detailed tracking
    const lead = await prisma.lead.create({
      data: {
        businessId,
        postId,
        leadType,
        source: metadata?.source || 'SOCIAL_MEDIA',
        estimatedValue: metadata?.value || calculateEstimatedValue(leadType),
        status: 'NEW'
      }
    });

    return {
      success: true,
      postId: post.id,
      leadId: lead.id
    };
  } catch (error) {
    console.error('Failed to track lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get field name for lead type
 */
function getLeadField(leadType: string): string {
  const mapping: Record<string, string> = {
    PHONE_CALL: 'phoneClicks',
    MESSAGE: 'messageClicks',
    WEBSITE_VISIT: 'websiteClicks',
    BOOKING: 'bookingClicks',
    DIRECTIONS: 'directionRequests'
  };
  return mapping[leadType] || 'clicks';
}

/**
 * Calculate estimated value of lead based on type
 */
function calculateEstimatedValue(leadType: string): number {
  const values: Record<string, number> = {
    PHONE_CALL: 50,      // High intent - phone call
    MESSAGE: 30,         // Medium intent - direct message
    WEBSITE_VISIT: 10,   // Low intent - website click
    BOOKING: 100,        // Highest intent - actual booking
    DIRECTIONS: 40       // Medium-high intent - visiting location
  };
  return values[leadType] || 25;
}

/**
 * Get lead summary for a business
 */
export async function getLeadSummary(businessId: string, days = 30): Promise<LeadSummary> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all posts for this business
  const posts = await prisma.post.findMany({
    where: {
      businessId,
      postedAt: {
        gte: startDate
      }
    },
    include: {
      draft: {
        select: {
          title: true
        }
      }
    }
  });

  // Filter out posts with null postedAt
  const validPosts = posts.filter((p): p is typeof p & { postedAt: Date } => p.postedAt !== null);

  // Aggregate leads
  let totalLeads = 0;
  const byType: Record<string, number> = {
    phoneCalls: 0,
    messages: 0,
    websiteVisits: 0,
    bookings: 0,
    directions: 0
  };

  const postPerformance = validPosts.map(post => {
    const leads =
      post.phoneClicks +
      post.messageClicks +
      post.websiteClicks +
      post.bookingClicks +
      post.directionRequests;

    const value =
      post.phoneClicks * 50 +
      post.messageClicks * 30 +
      post.websiteClicks * 10 +
      post.bookingClicks * 100 +
      post.directionRequests * 40;

    totalLeads += leads;
    byType.phoneCalls += post.phoneClicks;
    byType.messages += post.messageClicks;
    byType.websiteVisits += post.websiteClicks;
    byType.bookings += post.bookingClicks;
    byType.directions += post.directionRequests;

    return {
      postId: post.id,
      leads,
      value,
      title: post.draft?.title || 'Untitled',
      platform: post.platform,
      postedAt: post.postedAt
    };
  });

  // Sort by performance
  const topPerformingPosts = postPerformance
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const estimatedValue = postPerformance.reduce((sum, p) => sum + p.value, 0);

  return {
    totalLeads,
    byType,
    estimatedValue,
    topPerformingPosts
  };
}

/**
 * Get conversion rate for posts
 */
export async function getPostConversionRate(businessId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const posts = await prisma.post.count({
    where: {
      businessId,
      postedAt: {
        gte: startDate
      }
    }
  });

  const postsWithLeadsData = await prisma.post.findMany({
    where: {
      businessId,
      postedAt: {
        gte: startDate
      },
      OR: [
        { phoneClicks: { gt: 0 } },
        { messageClicks: { gt: 0 } },
        { websiteClicks: { gt: 0 } },
        { bookingClicks: { gt: 0 } },
        { directionRequests: { gt: 0 } }
      ]
    }
  });

  const postsWithLeads = postsWithLeadsData.length;

  const conversionRate = posts > 0 ? (postsWithLeads / posts) * 100 : 0;

  return {
    totalPosts: posts,
    postsWithLeads,
    conversionRate: conversionRate.toFixed(1) + '%'
  };
}
