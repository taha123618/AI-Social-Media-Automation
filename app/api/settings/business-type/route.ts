import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Industry templates with pre-configured settings
const INDUSTRY_TEMPLATES: Record<string, {
  name: string;
  description: string;
  icon: string;
  defaultTone: string;
  preferredTopics: string[];
  forbiddenWords: string[];
  ctaStyle: string;
  postingFrequency: number; // posts per week
  bestPlatforms: string[];
}> = {
  RESTAURANT: {
    name: 'Restaurant & Cafe',
    description: 'Restaurants, cafes, bars, bakeries',
    icon: '🍽️',
    defaultTone: 'warm-enthusiastic',
    preferredTopics: ['food quality', 'fresh ingredients', 'community', 'special events'],
    forbiddenWords: ['cheap', 'fast food', 'processed'],
    ctaStyle: 'Visit us today! Reserve your table.',
    postingFrequency: 5,
    bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'GOOGLE_BUSINESS']
  },
  SALON: {
    name: 'Salon & Beauty',
    description: 'Hair salons, barbershops, spas, nail salons',
    icon: '💇',
    defaultTone: 'friendly-professional',
    preferredTopics: ['transformations', 'self-care', 'trends', 'expert stylists'],
    forbiddenWords: ['cheap', 'discount', 'quick'],
    ctaStyle: 'Book your appointment now!',
    postingFrequency: 4,
    bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'TIKTOK']
  },
  CONTRACTOR: {
    name: 'Contractor & Trades',
    description: 'General contractors, handymen, builders',
    icon: '🔨',
    defaultTone: 'reliable-professional',
    preferredTopics: ['quality workmanship', 'before/after', 'customer satisfaction', 'safety'],
    forbiddenWords: ['cheap', 'cut corners', 'quick fix'],
    ctaStyle: 'Get a free estimate today!',
    postingFrequency: 3,
    bestPlatforms: ['FACEBOOK', 'LINKEDIN', 'GOOGLE_BUSINESS']
  },
  AUTO_REPAIR: {
    name: 'Auto Repair & Services',
    description: 'Mechanics, car washes, auto detailing',
    icon: '🔧',
    defaultTone: 'trustworthy-straightforward',
    preferredTopics: ['expertise', 'honest pricing', 'quick service', 'certified technicians'],
    forbiddenWords: ['overpriced', 'upsell', 'unnecessary'],
    ctaStyle: 'Schedule your service now!',
    postingFrequency: 3,
    bestPlatforms: ['FACEBOOK', 'GOOGLE_BUSINESS']
  },
  REAL_ESTATE: {
    name: 'Real Estate',
    description: 'Agents, brokers, property managers',
    icon: '🏠',
    defaultTone: 'professional-approachable',
    preferredTopics: ['market insights', 'new listings', 'success stories', 'local expertise'],
    forbiddenWords: ['pressure', 'desperate', 'deal'],
    ctaStyle: 'Contact me for a consultation!',
    postingFrequency: 5,
    bestPlatforms: ['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']
  },
  HEALTH_FITNESS: {
    name: 'Health & Fitness',
    description: 'Gyms, yoga studios, personal trainers',
    icon: '💪',
    defaultTone: 'motivational-supportive',
    preferredTopics: ['transformation stories', 'health tips', 'community', 'achievements'],
    forbiddenWords: ['quick fix', 'easy', 'guaranteed'],
    ctaStyle: 'Start your journey today!',
    postingFrequency: 5,
    bestPlatforms: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK']
  },
  MEDICAL_DENTAL: {
    name: 'Medical & Dental',
    description: 'Doctors, dentists, clinics, specialists',
    icon: '🏥',
    defaultTone: 'caring-professional',
    preferredTopics: ['patient care', 'advanced technology', 'health tips', 'team expertise'],
    forbiddenWords: ['painful', 'scary', 'expensive'],
    ctaStyle: 'Book your appointment today!',
    postingFrequency: 3,
    bestPlatforms: ['FACEBOOK', 'GOOGLE_BUSINESS', 'LINKEDIN']
  },
  LEGAL_FINANCIAL: {
    name: 'Legal & Financial',
    description: 'Lawyers, accountants, financial advisors',
    icon: '⚖️',
    defaultTone: 'authoritative-trustworthy',
    preferredTopics: ['expertise', 'client success', 'industry insights', 'trust'],
    forbiddenWords: ['guarantee', 'promise', 'risk-free'],
    ctaStyle: 'Schedule a consultation!',
    postingFrequency: 3,
    bestPlatforms: ['LINKEDIN', 'FACEBOOK']
  },
  RETAIL: {
    name: 'Retail & Shopping',
    description: 'Retail stores, boutiques, specialty shops',
    icon: '🛍️',
    defaultTone: 'excited-friendly',
    preferredTopics: ['new arrivals', 'special offers', 'customer favorites', 'style tips'],
    forbiddenWords: ['cheap', 'clearance', 'last chance'],
    ctaStyle: 'Shop now in-store or online!',
    postingFrequency: 5,
    bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'PINTEREST']
  },
  HOME_SERVICES: {
    name: 'Home Services',
    description: 'Plumbers, electricians, cleaners, HVAC',
    icon: '🏡',
    defaultTone: 'reliable-helpful',
    preferredTopics: ['quick response', 'expert service', 'customer satisfaction', 'tips'],
    forbiddenWords: ['expensive', 'messy', 'delay'],
    ctaStyle: 'Call now for same-day service!',
    postingFrequency: 3,
    bestPlatforms: ['FACEBOOK', 'GOOGLE_BUSINESS']
  },
  BEAUTY_COSMETICS: {
    name: 'Beauty & Cosmetics',
    description: 'Estheticians, makeup artists, lash technicians',
    icon: '💄',
    defaultTone: 'glamorous-friendly',
    preferredTopics: ['transformations', 'beauty tips', 'products', 'trends'],
    forbiddenWords: ['cheap', 'artificial', 'fake'],
    ctaStyle: 'Book your glam session!',
    postingFrequency: 5,
    bestPlatforms: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK']
  },
  EDUCATION: {
    name: 'Education & Tutoring',
    description: 'Tutoring, music lessons, schools, courses',
    icon: '📚',
    defaultTone: 'encouraging-knowledgeable',
    preferredTopics: ['student success', 'learning tips', 'course highlights', 'expertise'],
    forbiddenWords: ['difficult', 'failing', 'struggle'],
    ctaStyle: 'Enroll today!',
    postingFrequency: 4,
    bestPlatforms: ['FACEBOOK', 'LINKEDIN', 'INSTAGRAM']
  },
  PET_SERVICES: {
    name: 'Pet Services',
    description: 'Vets, groomers, pet sitting, training',
    icon: '🐾',
    defaultTone: 'loving-caring',
    preferredTopics: ['pet care tips', 'happy pets', 'success stories', 'team love'],
    forbiddenWords: ['aggressive', 'problem', 'difficult'],
    ctaStyle: 'Book your pet\'s appointment!',
    postingFrequency: 5,
    bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'TIKTOK']
  },
  PHOTOGRAPHY: {
    name: 'Photography & Video',
    description: 'Photographers, videographers, studios',
    icon: '📸',
    defaultTone: 'artistic-professional',
    preferredTopics: ['portfolio highlights', 'client sessions', 'behind-the-scenes', 'tips'],
    forbiddenWords: ['cheap', 'quick', 'basic'],
    ctaStyle: 'Book your session now!',
    postingFrequency: 4,
    bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'PINTEREST']
  },
  EVENT_SERVICES: {
    name: 'Event Services',
    description: 'Event planners, DJs, caterers, venues',
    icon: '🎉',
    defaultTone: 'exciting-professional',
    preferredTopics: ['event highlights', 'client testimonials', 'planning tips', 'packages'],
    forbiddenWords: ['stress', 'problems', 'issues'],
    ctaStyle: 'Let\'s plan your perfect event!',
    postingFrequency: 4,
    bestPlatforms: ['INSTAGRAM', 'FACEBOOK', 'PINTEREST']
  },
  PERSONAL_SERVICES: {
    name: 'Personal Services',
    description: 'Life coaches, therapists, counselors',
    icon: '🌟',
    defaultTone: 'empathetic-supportive',
    preferredTopics: ['personal growth', 'wellness tips', 'success stories', 'support'],
    forbiddenWords: ['broken', 'failed', 'wrong'],
    ctaStyle: 'Take the first step today!',
    postingFrequency: 4,
    bestPlatforms: ['LINKEDIN', 'FACEBOOK', 'INSTAGRAM']
  },
  OTHER: {
    name: 'Other Business',
    description: 'Other local businesses',
    icon: '🏢',
    defaultTone: 'professional-friendly',
    preferredTopics: ['services', 'customer success', 'expertise', 'community'],
    forbiddenWords: [],
    ctaStyle: 'Contact us today!',
    postingFrequency: 3,
    bestPlatforms: ['FACEBOOK', 'GOOGLE_BUSINESS', 'LINKEDIN']
  }
};

/**
 * GET /api/settings/business-type
 * Get all available business types with templates
 */
export async function GET() {
  try {
    const businessTypes = Object.entries(INDUSTRY_TEMPLATES).map(([key, template]) => ({
      id: key,
      ...template
    }));

    return NextResponse.json({
      success: true,
      businessTypes
    });
  } catch (error) {
    console.error('Failed to fetch business types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business types' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/settings/business-type/:id
 * Get specific business type template
 */
export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const businessTypeId = pathParts[pathParts.length - 1];

    if (!businessTypeId || !INDUSTRY_TEMPLATES[businessTypeId]) {
      return NextResponse.json(
        { error: 'Invalid business type' },
        { status: 400 }
      );
    }

    const template = INDUSTRY_TEMPLATES[businessTypeId];

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Failed to fetch business type template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business type template' },
      { status: 500 }
    );
  }
}
