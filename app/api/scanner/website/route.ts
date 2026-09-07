import { NextResponse } from 'next/server';
import { scrapeWebsite, analyzeBrandVoice } from '@/features/knowledge/services/website-scanner.service';
import { SecurityService } from '@/lib/security';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { websiteUrl, businessId } = await request.json();

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // SSRF Defense: Validate URL against internal network ranges and cloud metadata
    const urlValidation = SecurityService.validateSafeUrl(websiteUrl);
    if (!urlValidation.safe) {
      return NextResponse.json(
        { error: 'Blocked: Target URL is restricted or invalid', details: urlValidation.reason },
        { status: 400 }
      );
    }

    // Multi-tenant authorization check if businessId is supplied
    let industry: string | undefined;
    if (businessId) {
      const membership = await prisma.businessMember.findFirst({
        where: { businessId, userId: session.user.id },
      });

      if (!membership) {
        return NextResponse.json(
          { error: 'Forbidden: Access denied to this business' },
          { status: 403 }
        );
      }

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { profile: true }
      });
      industry = business?.profile?.industry || undefined;
    }

    // Scrape the website safely
    const scrapedData = await scrapeWebsite(websiteUrl);

    // Analyze brand voice based on scraped data
    const brandVoiceAnalysis = analyzeBrandVoice(scrapedData, industry);

    // Update business record with scraped data (authenticated & authorized only)
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
