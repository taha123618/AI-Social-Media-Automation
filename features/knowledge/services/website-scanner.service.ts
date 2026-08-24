import * as cheerio from 'cheerio';
import { SystemLogger } from '@/features/system/services/logger.service';

export interface ScrapedBusinessInfo {
  name?: string;
  description?: string;
  services: string[];
  phone?: string;
  email?: string;
  address?: string;
  hours?: Record<string, { open?: string; close?: string }>;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  images: string[];
}

/**
 * Scrape business information from a website
 */
export async function scrapeWebsite(url: string): Promise<ScrapedBusinessInfo> {
  const result: ScrapedBusinessInfo = {
    services: [],
    socialLinks: {},
    images: []
  };

  try {
    // Validate URL
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIGrowthBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    await SystemLogger.logActivity({
      action: 'WEBSITE_SCRAPE_STARTED',
      entity: 'KnowledgeSource',
      details: { url }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract business name
    result.name =
      $('h1').first().text().trim() ||
      $('.logo').text().trim() ||
      $('title').text().replace(/-.*$/, '').trim() ||
      undefined;

    // Extract description
    result.description =
      $('meta[name="description"]').attr('content') ||
      $('.hero p').first().text().trim() ||
      $('p.lead').first().text().trim() ||
      undefined;

    // Extract services - look for common patterns
    const serviceSelectors = [
      '.services li',
      '.service-item',
      '[class*="service"] li',
      '#services li',
      '.offerings li',
      '.features li'
    ];

    serviceSelectors.forEach(selector => {
      $(selector).each((_: number, el: any) => {
        const text = $(el).text().trim();
        if (text.length > 5 && text.length < 100 && !result.services.includes(text)) {
          result.services.push(text);
        }
      });
    });

    // If no services found, try to extract from text content
    if (result.services.length === 0) {
      $('p, li, h2, h3').each((_: number, el: any) => {
        const text = $(el).text().trim();
        if (
          text.length > 10 &&
          text.length < 150 &&
          (text.toLowerCase().includes('service') ||
           text.toLowerCase().includes('offer') ||
           text.toLowerCase().includes('specialize'))
        ) {
          result.services.push(text);
        }
      });
    }

    // Limit services to top 10
    result.services = result.services.slice(0, 10);

    // Extract phone number
    const phonePatterns = [
      /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/,
      /\d{3}[-.\s]\d{3}[-.\s]\d{4}/
    ];

    $('a[href^="tel:"], [class*="phone"], [class*="contact"]').each((_: number, el: any) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();

      if (href?.startsWith('tel:')) {
        result.phone = href.replace('tel:', '').trim();
      }

      if (!result.phone) {
        for (const pattern of phonePatterns) {
          const match = text.match(pattern);
          if (match) {
            result.phone = match[0];
            break;
          }
        }
      }
    });

    // Extract email
    $('a[href^="mailto:"]').each((_: number, el: any) => {
      const href = $(el).attr('href');
      if (href) {
        result.email = href.replace('mailto:', '').trim();
        return false;
      }
    });

    // Extract address
    $('[class*="address"], [class*="location"], footer address').each((_: number, el: any) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.length < 200) {
        result.address = text.replace(/\s+/g, ' ').trim();
        return false;
      }
    });

    // Extract business hours
    const hoursSelectors = [
      '[class*="hours"]',
      '[class*="opening"]',
      '.business-hours',
      '#hours'
    ];

    hoursSelectors.forEach(selector => {
      $(selector).each((_, el) => {
        const dayRow = $(el).find('[class*="day"], tr');
        dayRow.each((_, row) => {
          const dayText = $(row).text().trim();
          const dayMatch = dayText.match(/(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?/i);

          if (dayMatch) {
            const dayMap: Record<string, string> = {
              mon: 'monday', tue: 'tuesday', wed: 'wednesday',
              thu: 'thursday', fri: 'friday', sat: 'saturday', sun: 'sunday'
            };
            const day = dayMap[dayMatch[1].toLowerCase()];

            // Try to extract hours
            const timeMatch = dayText.match(/(\d{1,2}:\d{2}\s*[ap]?m?\s*-\s*\d{1,2}:\d{2}\s*[ap]?m?)/i);
            if (day && timeMatch) {
              result.hours = result.hours || {};
              result.hours[day] = { open: timeMatch[1].split('-')[0].trim(), close: timeMatch[1].split('-')[1]?.trim() };
            }
          }
        });
      });
    });

    // Extract social links
    result.socialLinks.facebook = $('a[href*="facebook.com"]').attr('href');
    result.socialLinks.instagram = $('a[href*="instagram.com"]').attr('href');
    result.socialLinks.twitter = $('a[href*="twitter.com"], a[href*="x.com"]').attr('href');
    result.socialLinks.linkedin = $('a[href*="linkedin.com"]').attr('href');

    // Extract images (limit to 10 relevant ones)
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt')?.toLowerCase() || '';

      if (src &&
          !src.includes('data:') &&
          !src.endsWith('.svg') &&
          (alt.includes('service') || alt.includes('team') || alt.includes('work') || result.images.length < 5)
      ) {
        const absoluteUrl = src.startsWith('http') ? src : new URL(src, url).href;
        if (!result.images.includes(absoluteUrl)) {
          result.images.push(absoluteUrl);
        }
      }
    });

    result.images = result.images.slice(0, 10);

    await SystemLogger.logActivity({
      action: 'WEBSITE_SCRAPE_COMPLETED',
      entity: 'KnowledgeSource',
      details: { url, servicesCount: result.services.length, imagesCount: result.images.length }
    });

    return result;
  } catch (error: any) {
    console.error('Website scraping error:', error);
    await SystemLogger.logError({
      message: error.message || 'Website scraping failed',
      source: 'WebsiteScanner.scrapeWebsite',
      context: { url }
    });
    throw error;
  }
}

/**
 * Analyze scraped data and suggest brand voice
 */
export function analyzeBrandVoice(scrapedData: ScrapedBusinessInfo, industry?: string) {
  const analysis = {
    tone: 'professional-friendly',
    style: 'informative',
    keywords: [] as string[],
    forbiddenWords: [] as string[],
    preferredTopics: [] as string[],
    ctaStyle: 'Contact us today!'
  };

  // Analyze description and services for tone
  const text = `${scrapedData.description || ''} ${scrapedData.services.join(' ')}`.toLowerCase();

  if (text.includes('luxury') || text.includes('premium') || text.includes('exclusive')) {
    analysis.tone = 'sophisticated-professional';
    analysis.forbiddenWords.push('cheap', 'discount', 'budget');
  } else if (text.includes('friendly') || text.includes('family') || text.includes('community')) {
    analysis.tone = 'warm-friendly';
    analysis.preferredTopics.push('community involvement', 'customer relationships');
  } else if (text.includes('expert') || text.includes('professional') || text.includes('certified')) {
    analysis.tone = 'authoritative-trustworthy';
    analysis.preferredTopics.push('expertise', 'credentials', 'experience');
  }

  // Extract keywords from services
  const commonKeywords = ['quality', 'service', 'professional', 'expert', 'best'];
  analysis.keywords = scrapedData.services
    .flatMap(s => s.split(' '))
    .filter(word => word.length > 4 && !commonKeywords.includes(word.toLowerCase()))
    .slice(0, 10);

  // Determine CTA style based on industry
  if (industry === 'RESTAURANT') {
    analysis.ctaStyle = 'Reserve your table today!';
  } else if (industry === 'SALON' || industry === 'BEAUTY_COSMETICS') {
    analysis.ctaStyle = 'Book your appointment now!';
  } else if (industry === 'CONTRACTOR' || industry === 'HOME_SERVICES') {
    analysis.ctaStyle = 'Get a free estimate!';
  } else if (industry === 'HEALTH_FITNESS') {
    analysis.ctaStyle = 'Start your journey today!';
  }

  return analysis;
}
