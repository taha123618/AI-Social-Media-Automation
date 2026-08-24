import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';
import { SystemLogger } from '@/features/system/services/logger.service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID required' },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { profile: true }
    });

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Resolve location and industry contexts safely
    const body = await req.json();
    console.log("taha123", body);
    const clientLocation = body?.location;
    let city = '';

    // 1. Try city from client request body
    if (clientLocation?.city) {
      city = clientLocation.city;
    }
    // 2. Try city from business.location Json field
    else if (business.location) {
      try {
        const locObj = typeof business.location === 'string' ? JSON.parse(business.location) : business.location;
        if (typeof locObj === 'object' && locObj !== null) {
          // Check various possible fields for city or address
          city = locObj?.city || locObj?.address || locObj?.fullAddress || '';
        } else if (typeof locObj === 'string') {
          city = locObj;
        }
      } catch {
        if (typeof business.location === 'string') {
          city = business.location;
        }
      }
    }

    // 3. Last resort fallback
    if (!city) {
      city = 'San Francisco';
    }

    console.log(`[Trends API] Resolved city: "${city}" for business: "${business.name}" (ID: ${businessId})`);
    if (clientLocation) console.log(`[Trends API] Client location provided:`, JSON.stringify(clientLocation));
    console.log(`[Trends API] Business location in DB:`, JSON.stringify(business.location));

    const industry = business.profile?.industry || business.businessType || 'Local Retail';
    const businessName = business.name;

    const prompt = `Formulate marketing opportunities for "${businessName}" located in "${city}" in the "${industry}" industry.
We want to leverage the current season, upcoming holidays/festivals, and weather to craft 3 distinct local marketing opportunities:
1. A WEATHER-based opportunity (e.g., Rainy Day or Sunny Day promotion).
2. An EVENT-based opportunity (e.g., Local Festival, Business Fair, or Concert promotion).
3. A SEASONAL-based opportunity (e.g., Summer launch, Winter Special, or Holiday promotion).

For each opportunity, generate:
- An offer/promo title
- Recommended discount value or specific promotion (e.g., 15% off, free upgrade, special combo)
- CTA (Call to action)
- A complete, highly engaging pre-written social post caption with 3-5 relevant local hashtags.

Return your response strictly in the following JSON format:
{
  "weatherSummary": "Forecast for city (e.g., 72°F & Sunny)",
  "opportunities": [
    {
      "title": "Opportunity Title",
      "type": "WEATHER",
      "trigger": "Weather trigger description",
      "strategy": "Why this works for the business",
      "recommendedOffer": {
        "title": "Promo title",
        "discountValue": "Offer discount detail",
        "cta": "CTA text"
      },
      "socialPostDraft": {
        "caption": "The social media caption",
        "hashtags": ["hashtag1", "hashtag2"],
        "cta": "Post CTA text"
      }
    }
  ]
}`;

    const response = await AIService.generateJSON({
      messages: [
        { role: 'system', content: 'You are a professional local business growth marketing strategist.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 4000 // Increased to handle 3 detailed opportunities with long captions
    });

    return NextResponse.json({
      success: true,
      data: response,
      business: { name: businessName, city, industry },
      timestamp: new Date()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code || 'TRENDS_ERROR';
    const isJSONError = errorMessage.includes('JSON') || errorMessage.includes('parse');

    await SystemLogger.logError({
      message: `Failed to execute local trend agent API: ${errorMessage}`,
      source: 'POST /api/trends/events',
      context: {
        code: errorCode,
        isJSONError,
        errorType: isJSONError ? 'JSON_PARSE_ERROR' : 'UNKNOWN',
        fullError: String(error)
      }
    });

    // Return detailed error for debugging
    const errorResponse: any = {
      success: false,
      error: {
        message: isJSONError
          ? 'Failed to parse AI response. The response may be incomplete. Please try again.'
          : errorMessage,
        code: isJSONError ? 'JSON_PARSE_ERROR' : errorCode,
      }
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.details = String(error);
      errorResponse.error.suggestion = isJSONError
        ? 'Try increasing maxTokens or simplifying the prompt'
        : 'Check API credentials and connection';
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
