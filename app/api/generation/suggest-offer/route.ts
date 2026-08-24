import { NextResponse } from 'next/server';
import { generateOffers, getSeasonalOffers } from '@/features/generation/services/offer-generator.service';

export async function POST(request: Request) {
  try {
    const { industry, season, businessGoal, currentMonth } = await request.json();

    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    // Generate offers based on parameters
    const offers = generateOffers({
      industry,
      season,
      businessGoal,
      currentMonth: currentMonth || new Date().getMonth()
    });

    // Add seasonal offers
    const seasonal = getSeasonalOffers(industry, currentMonth || new Date().getMonth());
    const allOffers = [...seasonal, ...offers];

    return NextResponse.json({
      success: true,
      data: {
        offers: allOffers,
        total: allOffers.length,
        recommendations: allOffers.slice(0, 3) // Top 3 recommendations
      }
    });
  } catch (error) {
    console.error('Offer generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate offers' },
      { status: 500 }
    );
  }
}
