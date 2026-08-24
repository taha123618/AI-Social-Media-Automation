import prisma from '@/lib/prisma';
import { getTemplatesByIndustry, fillTemplate } from '../templates/industry-templates';
import { generateOffers } from './offer-generator.service';
import { ContentIntent as GeneratedContentIntent, Platform as GeneratedPlatform } from '@/app/generated/prisma/enums';

export interface AutopilotConfig {
  businessId: string;
  days?: number; // default 30
  postsPerWeek?: number; // default based on industry
  platforms: GeneratedPlatform[];
  contentMix?: {
    educational: number; // percentage
    promotional: number;
    engagement: number;
    testimonial: number;
  };
}

interface GeneratedPostPlan {
  day: number;
  scheduledDate: Date;
  platform: GeneratedPlatform;
  intent: GeneratedContentIntent;
  templateId: string;
  caption: string;
  hashtags: string[];
  cta: string;
  mediaSuggestions: string[];
  offerId?: string;
}

/**
 * Industry-specific posting frequency recommendations
 */
const INDUSTRY_POSTING_FREQUENCY: Record<string, number> = {
  RESTAURANT: 5,      // 5 posts per week
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
 * Best posting times by industry and platform
 */
const BEST_POSTING_TIMES: Record<string, Record<string, number[]>> = {
  RESTAURANT: {
    INSTAGRAM: [11, 13, 18, 19], // 11 AM, 1 PM, 6 PM, 7 PM
    FACEBOOK: [10, 12, 17],
    TIKTOK: [12, 19, 20]
  },
  SALON: {
    INSTAGRAM: [10, 13, 18],
    FACEBOOK: [11, 14, 19],
    TIKTOK: [12, 16, 20]
  },
  CONTRACTOR: {
    FACEBOOK: [7, 12, 18],
    LINKEDIN: [8, 12, 17],
    GOOGLE_BUSINESS: [9, 13, 16]
  },
  RETAIL: {
    INSTAGRAM: [10, 13, 19],
    FACEBOOK: [11, 14, 18],
    PINTEREST: [20, 21, 22]
  },
  HEALTH_FITNESS: {
    INSTAGRAM: [6, 12, 17],
    FACEBOOK: [7, 12, 19],
    TIKTOK: [6, 17, 20]
  }
};

/**
 * Generate 30-day autopilot content plan
 */
export async function generateAutopilotPlan(config: AutopilotConfig): Promise<GeneratedPostPlan[]> {
  const {
    businessId,
    days = 30,
    platforms,
    contentMix = {
      educational: 30,
      promotional: 30,
      engagement: 25,
      testimonial: 15
    }
  } = config;

  // Get business details
  let business;
  try {
    business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        profile: true
      }
    });
  } catch (profileError) {
    console.error('Failed to fetch business profile:', profileError);
    // Try without profile as fallback
    business = await prisma.business.findUnique({
      where: { id: businessId }
    });
  }

  if (!business) {
    throw new Error(`Business not found with ID: ${businessId}`);
  }

  // Get industry from profile or default
  let industry = 'OTHER';
  try {
    const businessWithProfile = business as any;
    industry = businessWithProfile.profile?.industry || business.businessType || 'OTHER';
  } catch {
    industry = business.businessType || 'OTHER';
  }
  const postsPerWeek = config.postsPerWeek || INDUSTRY_POSTING_FREQUENCY[industry] || 3;
  const totalPosts = Math.floor((postsPerWeek * days) / 7);

  // Get templates and offers for this industry
  const templates = getTemplatesByIndustry(industry);
  const offers = generateOffers({ industry, currentMonth: new Date().getMonth() });

  // Get best posting times for this industry
  const postingTimes = BEST_POSTING_TIMES[industry] || BEST_POSTING_TIMES.RESTAURANT;

  const plan: GeneratedPostPlan[] = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  // Distribute content types according to mix
  const postDistribution = determinePostDistribution(totalPosts, contentMix);

  let postCount = 0;
  const currentDate = new Date(startDate);

  while (postCount < totalPosts && postCount < days) {
    // Determine what type of post this should be
    const postType = determinePostType(postCount, postDistribution);

    // Select appropriate template
    const template = selectTemplateForType(templates, postType);

    if (!template) continue;

    // Select platform (rotate through platforms)
    const platform = platforms[postCount % platforms.length];

    // Get optimal posting time for this day and platform
    const hour = getOptimalPostingTime(currentDate.getDay(), platform, postingTimes);
    const scheduledDate = new Date(currentDate);
    scheduledDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    // Generate caption using template
    const captionData = generateCaptionData(business, template, offers, postType);
    const caption = fillTemplate(template, captionData);

    // Generate relevant hashtags
    const hashtags = generateHashtags(industry, business.name || '', postType);

    // Select CTA
    const cta = selectCTA(template, offers, postType);

    plan.push({
      day: postCount + 1,
      scheduledDate,
      platform,
      intent: mapPostTypeToIntent(postType),
      templateId: template.id,
      caption,
      hashtags,
      cta,
      mediaSuggestions: suggestMediaForPostType(postType),
      offerId: postType === 'promotional' ? offers[0]?.id : undefined
    });

    // Move to next day (or add jitter for multiple posts per day)
    currentDate.setDate(currentDate.getDate() + 1);
    postCount++;
  }

  return plan;
}

/**
 * Determine how many posts of each type to create
 */
function determinePostDistribution(
  totalPosts: number,
  contentMix: { educational: number; promotional: number; engagement: number; testimonial: number }
): Record<string, number> {
  return {
    educational: Math.floor(totalPosts * (contentMix.educational / 100)),
    promotional: Math.floor(totalPosts * (contentMix.promotional / 100)),
    engagement: Math.floor(totalPosts * (contentMix.engagement / 100)),
    testimonial: Math.floor(totalPosts * (contentMix.testimonial / 100))
  };
}

/**
 * Determine post type based on distribution and current count
 */
function determinePostType(postIndex: number, distribution: Record<string, number>): string {
  const types = Object.keys(distribution);
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const normalizedIndex = (postIndex % total) / total;

  let cumulative = 0;
  for (const type of types) {
    cumulative += distribution[type] / total;
    if (normalizedIndex < cumulative) {
      return type;
    }
  }

  return types[0];
}

/**
 * Select template appropriate for post type
 */
function selectTemplateForType(templates: any[], postType: string) {
  const templateMapping: Record<string, string[]> = {
    educational: ['service-spotlight', 'market-update', 'class-promo'],
    promotional: ['special-offer', 'new-arrival', 'project-complete'],
    engagement: ['before-after', 'transformation', 'customer-favorite'],
    testimonial: ['customer-review', 'success-story', 'member-transformation']
  };

  const preferredIds = templateMapping[postType] || [];

  // Find matching template
  const template = templates.find(t =>
    preferredIds.some(id => t.id.includes(id))
  );

  return template || templates[0];
}

/**
 * Generate data to fill template variables
 */
function generateCaptionData(
  business: any,
  template: any,
  offers: any[],
  postType: string
): Record<string, string> {
  const profile = business.profile || {};
  const data: Record<string, string> = {
    business_name: business.name || 'Our Business',
    location: business.location ? JSON.parse(business.location).city || 'our area' : 'our area',
    phone: '(555) 123-4567', // Would come from business profile
    website: business.website || 'our website',
    cta: getGenericCTA(postType)
  };

  // Add offer details if promotional
  if (postType === 'promotional' && offers.length > 0) {
    const offer = offers[0];
    data.offer_details = offer.description;
    data.valid_dates = 'This month only';
  }

  // Fill in template-specific defaults
  const defaults: Record<string, string> = {
    before_state: 'ordinary',
    after_state: 'extraordinary',
    dish_name: 'signature dish',
    key_ingredient: 'fresh, local ingredients',
    hours: '9 AM - 9 PM',
    customer_quote: 'Amazing service!',
    customer_name: 'Happy Customer',
    item_name: 'favorite item',
    unique_selling_point: 'quality and attention to detail'
  };

  return { ...defaults, ...data };
}

/**
 * Generate relevant hashtags
 */
function generateHashtags(industry: string, businessName: string, postType: string): string[] {
  const industryTags: Record<string, string[]> = {
    RESTAURANT: ['#Foodie', '#LocalEats', '#RestaurantLife', '#FreshFood', '#SupportLocal'],
    SALON: ['#HairGoals', '#BeautySalon', '#HairTransformation', '#SelfCare', '#SalonLife'],
    CONTRACTOR: ['#HomeImprovement', '#Contractor', '#Renovation', '#QualityWork', '#TrustedPros'],
    RETAIL: ['#Shopping', '#NewArrivals', '#ShopLocal', '#RetailTherapy', '#SmallBusiness'],
    HEALTH_FITNESS: ['#Fitness', '#GymLife', '#HealthyLiving', '#WorkoutMotivation', '#FitFam']
  };

  const baseTags = industryTags[industry] || ['#LocalBusiness', '#SupportLocal'];

  const postTypeTags: Record<string, string[]> = {
    educational: ['#Tips', '#Expert', '#LearnMore'],
    promotional: ['#Sale', '#SpecialOffer', '#LimitedTime'],
    engagement: ['#BeforeAndAfter', '#Transformation', '#Results'],
    testimonial: ['#CustomerLove', '#FiveStars', '#Testimonial']
  };

  return [...baseTags.slice(0, 5), ...(postTypeTags[postType] || [])].slice(0, 10);
}

/**
 * Select appropriate CTA
 */
function selectCTA(template: any, offers: any[], postType: string): string {
  const ctaOptions: Record<string, string> = {
    educational: 'Save this for later! 📌',
    promotional: 'Claim your offer now! 👇',
    engagement: 'Tag a friend who needs this! 💬',
    testimonial: 'Ready for similar results? Contact us today!'
  };

  return ctaOptions[postType] || 'Contact us today!';
}

/**
 * Get generic CTA as fallback
 */
function getGenericCTA(postType: string): string {
  const ctas: Record<string, string> = {
    educational: 'Learn more at our location',
    promotional: 'Call now to claim this offer',
    engagement: 'Visit us today',
    testimonial: 'Experience the difference yourself'
  };

  return ctas[postType] || 'Contact us today';
}

/**
 * Map post type to content intent
 */
function mapPostTypeToIntent(postType: string): GeneratedContentIntent {
  const mapping: Record<string, GeneratedContentIntent> = {
    educational: GeneratedContentIntent.EDUCATION,
    promotional: GeneratedContentIntent.SALES,
    engagement: GeneratedContentIntent.ENGAGEMENT,
    testimonial: GeneratedContentIntent.BRAND_AWARENESS
  };

  return mapping[postType] || GeneratedContentIntent.ENGAGEMENT;
}

/**
 * Suggest what type of media to use
 */
function suggestMediaForPostType(postType: string): string[] {
  const suggestions: Record<string, string[]> = {
    educational: ['infographic', 'how-to photo', 'team member shot'],
    promotional: ['product photo', 'offer graphic', 'happy customer'],
    engagement: ['before/after comparison', 'behind-the-scenes', 'process video'],
    testimonial: ['customer photo', 'review screenshot', 'result photo']
  };

  return suggestions[postType] || ['business photo'];
}

/**
 * Get optimal posting time for given day and platform
 */
function getOptimalPostingTime(
  dayOfWeek: number,
  platform: GeneratedPlatform,
  postingTimes: Record<string, number[]>
): number {
  const platformTimes = postingTimes[platform] || [12]; // Default noon

  // Weekend vs weekday adjustments
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const adjustedTimes = isWeekend
    ? platformTimes.map(h => h + 1) // Post an hour later on weekends
    : platformTimes;

  // Pick random time from available slots
  const randomIndex = Math.floor(Math.random() * adjustedTimes.length);
  return adjustedTimes[randomIndex] || 12;
}

/**
 * Create actual draft posts from the plan
 */
export async function createDraftsFromPlan(plan: GeneratedPostPlan[], businessId: string, creatorId: string) {
  const drafts = [];

  for (const postPlan of plan) {
    const draft = await prisma.contentDraft.create({
      data: {
        businessId,
        creatorId,
        title: `Autopilot Post - Day ${postPlan.day}`,
        intent: postPlan.intent,
        platforms: [postPlan.platform],
        status: 'GENERATED', // Auto-generated, pending review
        scheduledFor: postPlan.scheduledDate,
        contentJson: {
          caption: postPlan.caption,
          hashtags: postPlan.hashtags,
          cta: postPlan.cta,
          templateId: postPlan.templateId,
          offerId: postPlan.offerId
        },
        visualPrompt: postPlan.mediaSuggestions.join(', ')
      }
    });

    drafts.push(draft);
  }

  return drafts;
}
