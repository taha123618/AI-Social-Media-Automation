import { NextResponse } from 'next/server';
import { scrapeWebsite, analyzeBrandVoice } from '@/features/knowledge/services/website-scanner.service';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { websiteUrl, businessId } = await request.json();

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Scrape the website
    const scrapedData = await scrapeWebsite(websiteUrl);

    // Get business to determine industry (if available)
    let industry: string | undefined;
    if (businessId) {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { profile: true }
      });
      industry = business?.profile?.industry || undefined;
    }

    // Analyze brand voice based on scraped data
    const brandVoiceAnalysis = analyzeBrandVoice(scrapedData, industry);

    // Update business record with scraped data
    if (businessId) {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          services: scrapedData.services,
          location: scrapedData.address ? JSON.stringify({ fullAddress: scrapedData.address }) : undefined,
          operatingHours: scrapedData.hours ? JSON.stringify(scrapedData.hours) : undefined,
          websiteScrapedAt: new Date(),
          profile: {
            update: {
              targetAudience: brandVoiceAnalysis.preferredTopics.join(', '),
              forbiddenWords: brandVoiceAnalysis.forbiddenWords,
              tone: brandVoiceAnalysis.tone
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        scraped: scrapedData,
        brandVoice: brandVoiceAnalysis
      }
    });
  } catch (error) {
    console.error('Website scanning failed:', error);
    return NextResponse.json(
      { error: 'Failed to scan website', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
