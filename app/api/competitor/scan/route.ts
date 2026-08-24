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

    console.log(`[Competitor Scan] Resolved city: "${city}" for business: "${business.name}" (ID: ${businessId})`);
    if (clientLocation) console.log(`[Competitor Scan] Client location provided:`, JSON.stringify(clientLocation));
    console.log(`[Competitor Scan] Business location in DB:`, JSON.stringify(business.location));

    const industry = business.profile?.industry || business.businessType || 'Local Retail';
    const businessName = business.name;

    const cacheKey = `comp-scan-${businessId}-${city}-${industry}`.replace(/\s+/g, '-').toLowerCase();
    console.log(`[Competitor Scan] Using prompt for: ${businessName} in ${city} (${industry})`);

    const prompt = `Analyze local competitors for "${businessName}" in "${city}". The business is in the "${industry}" industry.
Identify 3 key local competitors. Provide estimated popularity index (1-100), posting frequency, content style, engagement level, estimated growth, list of strengths, list of weaknesses, and a suggested counter-strategy for each.
Also provide an overall recommended strategy to stand out and capture market share.

Return your response strictly in the following JSON format:
{
  "summary": "Executive summary of the competitive landscape",
  "competitors": [
    {
      "name": "Competitor Name",
      "estimatedPopularity": 85,
      "postingFrequency": "Daily",
      "contentStyle": "Sleek and promotional",
      "engagementLevel": "High",
      "estimatedGrowth": "Growing",
      "strengths": ["Strong visual branding", "Consistent schedule"],
      "weaknesses": ["Low customer interaction in comments", "High pricing"],
      "suggestedCounterStrategy": "Highlight personal touch and neighbor-focused pricing discounts."
    }
  ],
  "overallStrategy": {
    "title": "Strategy title",
    "description": "Strategy description",
    "actionSteps": ["Action step 1", "Action step 2"],
    "opportunityDifferentiator": "The key differentiator opportunity"
  }
}`;

    const response = await AIService.generateJSON({
      messages: [
        { role: 'system', content: 'You are a professional local business competitor intelligence analyst.' },
        { role: 'user', content: prompt }
      ]
    });

    return NextResponse.json({
      success: true,
      data: response,
      business: { name: businessName, city, industry },
      timestamp: new Date()
    });
  } catch (error) {
    await SystemLogger.logError({
      message: `Failed to execute competitor scanner API: ${error}`,
      source: 'POST /api/competitor/scan',
    });

    return NextResponse.json(
      { success: false, error: 'Failed to perform competitor analysis' },
      { status: 500 }
    );
  }
}
