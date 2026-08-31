import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import {
  CarouselDeck,
  CarouselSlide,
  CarouselTheme,
  CarouselThemeConfig,
  GenerateCarouselInput,
  CAROUSEL_THEMES,
} from '../types/carousel.types';

export { CAROUSEL_THEMES };

export class CarouselService {
  /**
   * Get all supported visual themes
   */
  static getThemes(): CarouselThemeConfig[] {
    return Object.values(CAROUSEL_THEMES);
  }

  /**
   * Generate an AI-powered structured carousel deck
   */
  static async generateCarouselDeck(input: GenerateCarouselInput): Promise<CarouselDeck> {
    const {
      businessId,
      topic,
      sourceText,
      targetPlatform = 'LINKEDIN',
      aspectRatio = '4:5',
      theme = 'DARK_GLASS',
      slideCount = 5,
      brandVoiceTone,
    } = input;

    // 1. Fetch business context & brand profile if available
    let brandContext = '';
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { profile: true, brandProfiles: true },
      });

      if (business) {
        const profile = business.profile;
        const brandProfile = business.brandProfiles?.[0];
        const tone = brandVoiceTone || brandProfile?.tone || profile?.tone || 'Professional, authoritative, actionable';
        const audience = (profile as any)?.targetAudience || (business as any)?.description || 'Industry professionals and entrepreneurs';
        brandContext = `\nBrand Name: ${business.name}\nTone: ${tone}\nTarget Audience: ${audience}`;
      }
    } catch (err) {
      console.warn('[CAROUSEL] Could not fetch business context for brand injection:', err);
    }

    // 2. Synthesize structured slide deck with AIService
    const prompt = `You are an expert social media carousel strategist for ${targetPlatform}.
Create a high-converting ${slideCount}-slide carousel on the topic: "${topic}".
${sourceText ? `\nSource material to distill:\n"${sourceText}"\n` : ''}
${brandContext}

Format your response ONLY as valid JSON matching this schema:
{
  "title": "Short title of the carousel",
  "caption": "Engaging social post caption with hook, value points, and call to action",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
  "slides": [
    {
      "slideNumber": 1,
      "layout": "TITLE",
      "headline": "Bold Hook / Main Title",
      "subheadline": "Compelling subtitle that forces swipe",
      "highlightText": "KEY PHRASE"
    },
    {
      "slideNumber": 2,
      "layout": "CONTENT",
      "headline": "Point 1 Title",
      "bodyText": "Concise high-impact explanation",
      "bulletPoints": ["Key takeaway 1", "Key takeaway 2"]
    },
    {
      "slideNumber": 3,
      "layout": "STATISTIC",
      "headline": "The Shocking Reality",
      "statValue": "87%",
      "statLabel": "of leaders report faster growth using automation",
      "bodyText": "Contextual sentence explaining why this matters"
    },
    {
      "slideNumber": 4,
      "layout": "QUOTE",
      "headline": "Fundamental Principle",
      "bodyText": "Memorable quote or core truth",
      "authorOrAttribution": "Key Takeaway"
    },
    {
      "slideNumber": 5,
      "layout": "CTA",
      "headline": "Take Action Today",
      "subheadline": "Swipe down to save this post for later",
      "ctaButtonText": "Follow for more insights"
    }
  ]
}

Ensure the slide layouts vary across TITLE, CONTENT, STATISTIC, QUOTE, STEPS, CTA to keep maximum visual interest. Keep headlines punchy and under 10 words.`;

    let generatedData: any = null;
    try {
      const response = await AIService.generateResponse({
        messages: [
          { role: 'system', content: 'You are a master social media designer that returns only valid JSON without markdown wrapping.' },
          { role: 'user', content: prompt },
        ],
      });

      const responseText = response.content || '';

      // Clean potential JSON markdown fences
      const cleaned = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      generatedData = JSON.parse(cleaned);
    } catch (aiErr) {
      console.warn('[CAROUSEL] AIService parse fallback triggered:', aiErr);
      // Fallback deterministic template
      generatedData = CarouselService.buildFallbackDeck(topic, slideCount);
    }

    const slides: CarouselSlide[] = (generatedData.slides || []).map((s: any, idx: number) => ({
      id: `slide_${Date.now()}_${idx + 1}`,
      slideNumber: idx + 1,
      layout: s.layout || (idx === 0 ? 'TITLE' : idx === slideCount - 1 ? 'CTA' : 'CONTENT'),
      headline: s.headline || `Key Insight #${idx + 1}`,
      subheadline: s.subheadline,
      bodyText: s.bodyText,
      highlightText: s.highlightText,
      bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : undefined,
      statValue: s.statValue,
      statLabel: s.statLabel,
      authorOrAttribution: s.authorOrAttribution,
      ctaButtonText: s.ctaButtonText || (idx === slideCount - 1 ? 'Save & Share' : undefined),
    }));

    const deck: CarouselDeck = {
      id: `deck_${Date.now()}`,
      businessId,
      title: generatedData.title || topic,
      topic,
      targetPlatform,
      aspectRatio,
      theme,
      slides,
      caption: generatedData.caption || `Here is a breakdown of ${topic}. Swipe through to see the core insights!`,
      hashtags: Array.isArray(generatedData.hashtags) ? generatedData.hashtags : ['#Leadership', '#Growth', '#Strategy'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await SystemLogger.logActivity({
      action: 'CAROUSEL_DECK_GENERATED',
      entity: 'CarouselBuilder',
      businessId,
      details: {
        title: deck.title,
        slideCount: deck.slides.length,
        theme: deck.theme,
        targetPlatform: deck.targetPlatform,
      },
    });

    return deck;
  }

  /**
   * Deterministic fallback generator for offline or mocked environments
   */
  static buildFallbackDeck(topic: string, count: number = 5): any {
    return {
      title: `${topic}: The Strategic Playbook`,
      caption: `Swipe through for a step-by-step roadmap on ${topic}. Save this post to refer back! 📌`,
      hashtags: ['#MarketingStrategy', '#Automation', '#GrowthHacking', '#Productivity'],
      slides: [
        {
          slideNumber: 1,
          layout: 'TITLE',
          headline: `How to Master ${topic}`,
          subheadline: 'The modern framework used by top industry leaders',
          highlightText: 'EXECUTIVE GUIDE'
        },
        {
          slideNumber: 2,
          layout: 'CONTENT',
          headline: '1. Establish Core Foundations',
          bodyText: `Before scaling ${topic}, ensure your data pipelines and workflows are synchronized.`,
          bulletPoints: ['Audit current bottlenecks', 'Eliminate manual handoffs', 'Establish baseline KPIs']
        },
        {
          slideNumber: 3,
          layout: 'STATISTIC',
          headline: 'Compounding Efficiency',
          statValue: '3.8x',
          statLabel: 'Average output boost achieved after workflow automation',
          bodyText: 'Teams that leverage multi-agent pipelines outpace manual creators consistently.'
        },
        {
          slideNumber: 4,
          layout: 'QUOTE',
          headline: 'The Guiding Principle',
          bodyText: 'Consistency is what transforms average intent into an unstoppable moat.',
          authorOrAttribution: 'Growth Principle'
        },
        {
          slideNumber: 5,
          layout: 'CTA',
          headline: 'Put This Into Practice',
          subheadline: 'Bookmark this carousel and share it with your team.',
          ctaButtonText: 'Follow For More'
        }
      ].slice(0, Math.max(3, count))
    };
  }
}
