import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';

const PLATFORM_CONTENT_RULES: Record<string, string> = {
  INSTAGRAM: 'Instagram: Use emojis, line breaks, 20-30 relevant hashtags at end, visual storytelling, hook in first line',
  FACEBOOK: 'Facebook: Conversational and relatable, 1-3 hashtags max, encourage comments/shares, slightly longer is ok',
  LINKEDIN: 'LinkedIn: Professional tone, no hashtags in body (3-5 at end only), thought leadership angle, 150-300 words',
  TIKTOK: 'TikTok: Hook in first 3 words, Gen-Z friendly language, 3-5 trending hashtags, 50-100 words max',
  GOOGLE_MY_BUSINESS: 'Google My Business: Local SEO keywords, clear CTA with phone/location, service + city mention, 150-300 words',
  SNAPCHAT: 'Snapchat: Ultra casual, 1-2 sentences only, FOMO-driven, emoji heavy',
  THREADS: 'Threads: Conversational, short takes, debate-worthy opinions, 150 chars ideal, minimal hashtags',
  TWITTER: 'Twitter/X: Under 280 chars, punchy and direct, 1-2 hashtags max, hook-first',
};

const INDUSTRY_OFFER_IDEAS: Record<string, string[]> = {
  RESTAURANT: ['Happy Hour Special', 'Family Meal Deal', 'New Menu Item Launch', 'Chef Special of the Week', 'Weekend Brunch Promo'],
  SALON: ['Book Now Get 10% Off', 'New Client Special', 'Seasonal Hair Transformation', 'Bundle & Save Package', 'Referral Reward Offer'],
  CONTRACTOR: ['Free Estimate This Week', 'Before & After Project Showcase', 'Seasonal Maintenance Deal', 'Local Job Spotlight', 'Customer Testimonial Feature'],
  AUTO_REPAIR: ['Free Inspection Special', 'Oil Change Bundle', 'Summer Car Care Package', 'Fleet Service Discount', 'Warranty Highlight'],
  REAL_ESTATE: ['Just Listed Spotlight', 'Market Update', 'Home Buying Tips', 'Neighborhood Feature', 'Success Story'],
  HEALTH_FITNESS: ['New Member Special', '30-Day Challenge', 'Transformation Tuesday', 'Class Spotlight', 'Nutrition Tip'],
  RETAIL: ['Flash Sale', 'New Arrivals', 'Buy One Get One', 'Limited Stock Alert', 'Customer Favorite Feature'],
  HOME_SERVICES: ['Spring Cleaning Special', 'Book Online Discount', 'Before & After Showcase', 'Service Bundle Deal', 'Free Consultation'],
  BEAUTY_COSMETICS: ['New Product Launch', 'Tutorial Feature', 'Before & After Glow Up', 'Holiday Gift Set', 'Loyalty Points Promo'],
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    // Verify access
    const member = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: session.user.id, businessId } }
    });
    if (!member) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });

    const { focus = 'offer', platforms = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'], count = 6 } = await req.json();

    // Fetch business profile for context
    const profile = await prisma.businessProfile.findUnique({
      where: { businessId },
      include: { summaries: true }
    });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    const industry = profile?.industry || business?.businessType || 'OTHER';
    const offerIdeas = INDUSTRY_OFFER_IDEAS[industry] || INDUSTRY_OFFER_IDEAS.HOME_SERVICES;

    // Fetch Knowledge Base for richer personalization (products, offers, services)
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { businessId },
      include: {
        chunks: { take: 10, orderBy: { documentId: 'asc' } },
        documents: { take: 5 }
      }
    });

    const knowledgeContext = knowledgeBase?.chunks?.length
      ? knowledgeBase.chunks.map(c => c.content).join('\n').slice(0, 800)
      : null;

    // Build brand context
    const brandDNA = profile?.summaries?.isApproved
      ? `Brand Summary: ${profile.summaries.shortSummary}\nElevator Pitch: ${profile.summaries.elevatorPitch}\nPositioning: ${profile.summaries.marketingPositioning}`
      : [
          profile?.mission && `Mission: ${profile.mission}`,
          profile?.uvp && `UVP: ${profile.uvp}`,
          profile?.targetAudience && `Target Audience: ${profile.targetAudience}`,
          profile?.tone && `Brand Tone: ${profile.tone}`,
        ].filter(Boolean).join('\n') || 'A local business looking to grow';

    const productsServices = profile?.productsServices
      ? JSON.stringify(profile.productsServices).slice(0, 400)
      : offerIdeas.slice(0, 3).join(', ');

    const platformRules = platforms
      .map((p: string) => PLATFORM_CONTENT_RULES[p])
      .filter(Boolean)
      .join('\n');

    const focusInstructions: Record<string, string> = {
      offer: `Focus on OFFERS and PROMOTIONS. Reference these product/service ideas: ${productsServices}. Include a specific discount, deal, or limited-time offer.`,
      educational: `Focus on TIPS and EDUCATION that position this brand as an expert. Share actionable advice the target audience would find valuable.`,
      engagement: `Focus on ENGAGEMENT and COMMUNITY. Ask questions, share relatable stories, encourage comments and shares.`,
      promo: `Focus on SOCIAL PROOF and RESULTS. Reference customer transformations, before/afters, testimonials, or impressive stats.`,
    };

    const systemPrompt = `You are an elite social media content strategist specializing in revenue-generating content for local businesses. 
Your posts convert followers into paying customers. You write for real humans, not algorithms.
You understand that local businesses need content that directly drives bookings, calls, and foot traffic.

BRAND CONTEXT:
${brandDNA}
Industry: ${industry}

PLATFORM FORMATTING RULES (apply the relevant ones):
${platformRules}

Return ONLY valid JSON — no markdown, no extra text.`;

    const knowledgeContextBlock = knowledgeContext
      ? `\nKNOWLEDGE BASE CONTEXT (actual business products/services/offers):\n${knowledgeContext}\n\nUse this context to make ideas specific to actual business offerings.`
      : '';

    const userPrompt = `Generate exactly ${count} post ideas. ${focusInstructions[focus] || focusInstructions.offer}${knowledgeContextBlock}

Each idea must be an object with:
- id: unique string (e.g. "idea-1")
- title: Short catchy title for this idea (3-6 words)
- caption: Full ready-to-post caption formatted for the FIRST platform in the list: ${platforms[0]}
- hashtags: Array of 5-15 relevant hashtags (without #)
- cta: One strong call-to-action sentence (e.g. "Book your free consultation today!")
- tone: One word tone tag (e.g. "urgent", "inspiring", "friendly", "professional")
- platform: "${platforms[0]}"
- offerType: Category of this idea (e.g. "promotion", "educational", "social proof", "engagement")

Return as JSON: { "ideas": [...] }`;

    const result = await AIService.generateJSON<{ ideas: any[] }>({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.75,
      maxTokens: 4096,
    });

    return NextResponse.json({ success: true, ideas: result.ideas || [], industry });
  } catch (error: any) {
    console.error('[Generate Ideas Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to generate ideas' }, { status: 500 });
  }
}
