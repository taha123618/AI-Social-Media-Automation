import { NextResponse } from 'next/server';
import { CarouselService } from '@/features/carousel_builder/services/carousel.service';

export async function GET() {
  try {
    const themes = CarouselService.getThemes();
    return NextResponse.json({ success: true, themes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch carousel templates' },
      { status: 500 }
    );
  }
}
