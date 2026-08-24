/**
 * AI Offer & Promotion Generator for Local Businesses
 * Generates strategic offers based on industry, seasonality, and business goals
 */

export interface OfferSuggestion {
  id: string;
  title: string;
  description: string;
  offerType: OfferType;
  urgency: 'low' | 'medium' | 'high';
  estimatedConversionRate: number; // percentage
  bestPlatforms: string[];
  suggestedDuration: number; // days
  termsAndConditions?: string;
}

type OfferType =
  | 'PERCENTAGE_DISCOUNT'
  | 'FIXED_AMOUNT_DISCOUNT'
  | 'BUY_ONE_GET_ONE'
  | 'FREE_CONSULTATION'
  | 'LIMITED_TIME_SPECIAL'
  | 'LOYALTY_REWARD'
  | 'REFERRAL_BONUS'
  | 'SEASONAL_PROMOTION'
  | 'FLASH_SALE'
  | 'BUNDLE_DEAL';

interface IndustryOfferPatterns {
  patterns: Array<{
    trigger: string;
    offers: OfferSuggestion[];
  }>;
  evergreen: OfferSuggestion[];
}

// Restaurant Offer Patterns
const restaurantOffers: IndustryOfferPatterns = {
  patterns: [
    {
      trigger: 'slow_days', // Monday-Tuesday
      offers: [
        {
          id: 'rest-monday-special',
          title: 'Monday Madness Special',
          description: 'Get 20% off all entrees every Monday!',
          offerType: 'PERCENTAGE_DISCOUNT',
          urgency: 'medium',
          estimatedConversionRate: 15,
          bestPlatforms: ['FACEBOOK', 'INSTAGRAM', 'EMAIL'],
          suggestedDuration: 1,
          termsAndConditions: 'Dine-in only. Cannot be combined with other offers.'
        }
      ]
    },
    {
      trigger: 'happy_hour',
      offers: [
        {
          id: 'rest-happy-hour',
          title: 'Happy Hour Half-Price',
          description: '50% off all appetizers and drinks from 4-6 PM',
          offerType: 'PERCENTAGE_DISCOUNT',
          urgency: 'low',
          estimatedConversionRate: 25,
          bestPlatforms: ['INSTAGRAM', 'FACEBOOK'],
          suggestedDuration: 7,
          termsAndConditions: 'Bar area only. 4-6 PM weekdays.'
        }
      ]
    },
    {
      trigger: 'date_night',
      offers: [
        {
          id: 'rest-date-night',
          title: 'Romantic Dinner for Two',
          description: '3-course dinner for two at a special price',
          offerType: 'BUNDLE_DEAL',
          urgency: 'medium',
          estimatedConversionRate: 20,
          bestPlatforms: ['FACEBOOK', 'INSTAGRAM'],
          suggestedDuration: 14,
          termsAndConditions: 'Reservations required. Friday-Saturday evenings.'
        }
      ]
    }
  ],
  evergreen: [
    {
      id: 'rest-first-time',
      title: 'First Visit Welcome Offer',
      description: '15% off your first order when you sign up for our newsletter',
      offerType: 'PERCENTAGE_DISCOUNT',
      urgency: 'low',
      estimatedConversionRate: 30,
      bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'GOOGLE_BUSINESS'],
      suggestedDuration: 30,
      termsAndConditions: 'New customers only. One per household.'
    },
    {
      id: 'rest-takeout-special',
      title: 'Takeout Tuesday',
      description: 'Free dessert with any takeout order over $50',
      offerType: 'BUNDLE_DEAL',
      urgency: 'low',
      estimatedConversionRate: 18,
      bestPlatforms: ['FACEBOOK', 'INSTAGRAM'],
      suggestedDuration: 7,
      termsAndConditions: 'Takeout orders only. Minimum $50 purchase.'
    }
  ]
};

// Salon Offer Patterns
const salonOffers: IndustryOfferPatterns = {
  patterns: [
    {
      trigger: 'new_client',
      offers: [
        {
          id: 'salon-new-client',
          title: 'New Client Special',
          description: '$25 off your first service of $100 or more',
          offerType: 'FIXED_AMOUNT_DISCOUNT',
          urgency: 'medium',
          estimatedConversionRate: 35,
          bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'GOOGLE_BUSINESS'],
          suggestedDuration: 30,
          termsAndConditions: 'New clients only. Minimum $100 service.'
        }
      ]
    },
    {
      trigger: 'slow_weekday',
      offers: [
        {
          id: 'salon-monday-magic',
          title: 'Manicure Monday',
          description: 'Buy one manicure, get one 50% off',
          offerType: 'BUY_ONE_GET_ONE',
          urgency: 'low',
          estimatedConversionRate: 22,
          bestPlatforms: ['INSTAGRAM', 'FACEBOOK'],
          suggestedDuration: 7,
          termsAndConditions: 'Mondays only. Same service for both.'
        }
      ]
    }
  ],
  evergreen: [
    {
      id: 'salon-referral',
      title: 'Refer a Friend Program',
      description: 'Give $20, Get $20 - Refer a friend and you both save!',
      offerType: 'REFERRAL_BONUS',
      urgency: 'low',
      estimatedConversionRate: 28,
      bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'EMAIL'],
      suggestedDuration: 90,
      termsAndConditions: 'Friend must be new client. Credit applied after their first visit.'
    },
    {
      id: 'salon-package-deal',
      title: 'Pamper Package',
      description: 'Haircut + Color + Style - Save 20% when bundled',
      offerType: 'BUNDLE_DEAL',
      urgency: 'low',
      estimatedConversionRate: 25,
      bestPlatforms: ['INSTAGRAM', 'FACEBOOK'],
      suggestedDuration: 30,
      termsAndConditions: 'Cannot be combined with other offers.'
    }
  ]
};

// Contractor Offer Patterns
const contractorOffers: IndustryOfferPatterns = {
  patterns: [
    {
      trigger: 'seasonal_spring',
      offers: [
        {
          id: 'contractor-spring-cleanup',
          title: 'Spring Home Improvement Special',
          description: '15% off all exterior projects booked in March-April',
          offerType: 'PERCENTAGE_DISCOUNT',
          urgency: 'medium',
          estimatedConversionRate: 12,
          bestPlatforms: ['FACEBOOK', 'GOOGLE_BUSINESS', 'NEXTDOOR'],
          suggestedDuration: 60,
          termsAndConditions: 'Exterior projects only. Must book by April 30.'
        }
      ]
    },
    {
      trigger: 'emergency_service',
      offers: [
        {
          id: 'contractor-emergency',
          title: '24/7 Emergency Service Available',
          description: 'Same-day emergency repairs - No extra charge!',
          offerType: 'LIMITED_TIME_SPECIAL',
          urgency: 'high',
          estimatedConversionRate: 40,
          bestPlatforms: ['GOOGLE_BUSINESS', 'FACEBOOK'],
          suggestedDuration: 365,
          termsAndConditions: 'Emergency calls only. Standard rates apply.'
        }
      ]
    }
  ],
  evergreen: [
    {
      id: 'contractor-free-estimate',
      title: 'Free No-Obligation Estimate',
      description: 'Get a free, detailed estimate for your project',
      offerType: 'FREE_CONSULTATION',
      urgency: 'low',
      estimatedConversionRate: 35,
      bestPlatforms: ['FACEBOOK', 'GOOGLE_BUSINESS', 'LINKEDIN'],
      suggestedDuration: 365,
      termsAndConditions: 'Residential projects only.'
    },
    {
      id: 'contractor-senior-discount',
      title: 'Senior Citizen Discount',
      description: '10% off for seniors 65+',
      offerType: 'PERCENTAGE_DISCOUNT',
      urgency: 'low',
      estimatedConversionRate: 20,
      bestPlatforms: ['FACEBOOK', 'NEXTDOOR'],
      suggestedDuration: 365,
      termsAndConditions: 'Valid ID required. Cannot combine with other offers.'
    }
  ]
};

// Retail Offer Patterns
const retailOffers: IndustryOfferPatterns = {
  patterns: [
    {
      trigger: 'clearance',
      offers: [
        {
          id: 'retail-clearance',
          title: 'End of Season Clearance',
          description: 'Up to 70% off select items - While supplies last!',
          offerType: 'PERCENTAGE_DISCOUNT',
          urgency: 'high',
          estimatedConversionRate: 30,
          bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'EMAIL'],
          suggestedDuration: 14,
          termsAndConditions: 'Final sale. No returns or exchanges.'
        }
      ]
    },
    {
      trigger: 'new_collection',
      offers: [
        {
          id: 'retail-vip-preview',
          title: 'VIP Early Access',
          description: 'Shop our new collection 24 hours before everyone else!',
          offerType: 'LIMITED_TIME_SPECIAL',
          urgency: 'high',
          estimatedConversionRate: 25,
          bestPlatforms: ['INSTAGRAM', 'EMAIL'],
          suggestedDuration: 1,
          termsAndConditions: 'Email subscribers only.'
        }
      ]
    }
  ],
  evergreen: [
    {
      id: 'retail-loyalty',
      title: 'Rewards Membership',
      description: 'Earn 1 point per dollar. 100 points = $10 off!',
      offerType: 'LOYALTY_REWARD',
      urgency: 'low',
      estimatedConversionRate: 40,
      bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'IN_STORE'],
      suggestedDuration: 365,
      termsAndConditions: 'Points expire after 12 months of inactivity.'
    }
  ]
};

// Main function to generate offers
export function generateOffers(params: {
  industry: string;
  season?: string;
  businessGoal?: 'awareness' | 'leads' | 'sales' | 'retention';
  currentMonth?: number; // 0-11
}): OfferSuggestion[] {
  const { industry, season, businessGoal, currentMonth } = params;

  // Get industry-specific offers
  let offers: OfferSuggestion[] = [];

  switch (industry.toUpperCase()) {
    case 'RESTAURANT':
      offers = [...restaurantOffers.patterns.flatMap(p => p.offers), ...restaurantOffers.evergreen];
      break;
    case 'SALON':
    case 'BEAUTY_COSMETICS':
      offers = [...salonOffers.patterns.flatMap(p => p.offers), ...salonOffers.evergreen];
      break;
    case 'CONTRACTOR':
    case 'HOME_SERVICES':
    case 'AUTO_REPAIR':
      offers = [...contractorOffers.patterns.flatMap(p => p.offers), ...contractorOffers.evergreen];
      break;
    case 'RETAIL':
      offers = [...retailOffers.patterns.flatMap(p => p.offers), ...retailOffers.evergreen];
      break;
    default:
      // Return generic offers for unspecified industries
      offers = restaurantOffers.evergreen;
  }

  // Filter by business goal if specified
  if (businessGoal) {
    switch (businessGoal) {
      case 'awareness':
        offers = offers.filter(o => o.urgency === 'high' || o.estimatedConversionRate > 25);
        break;
      case 'leads':
        offers = offers.filter(o => o.offerType === 'FREE_CONSULTATION' || o.estimatedConversionRate > 20);
        break;
      case 'sales':
        offers = offers.filter(o => o.urgency === 'high' || o.urgency === 'medium');
        break;
      case 'retention':
        offers = offers.filter(o => o.offerType === 'LOYALTY_REWARD' || o.offerType === 'REFERRAL_BONUS');
        break;
    }
  }

  // Sort by estimated conversion rate
  return offers.sort((a, b) => b.estimatedConversionRate - a.estimatedConversionRate);
}

// Generate seasonal offers
export function getSeasonalOffers(industry: string, month: number): OfferSuggestion[] {
  const seasonalOffers: OfferSuggestion[] = [];

  // Quick implementation - can be expanded
  if (month === 1) { // February
    if (industry === 'RESTAURANT') {
      seasonalOffers.push({
        id: 'valentines-dinner',
        title: "Valentine's Day Special",
        description: 'Romantic dinner for two with complimentary champagne',
        offerType: 'BUNDLE_DEAL',
        urgency: 'high',
        estimatedConversionRate: 35,
        bestPlatforms: ['INSTAGRAM', 'FACEBOOK'],
        suggestedDuration: 7,
        termsAndConditions: 'February 14th only. Reservations required.'
      });
    }
  }

  return seasonalOffers;
}
