import { AIService } from '@/services/ai/ai.service';
import { z } from 'zod';

export const CampaignBriefSchema = z.object({
  productName: z.string(),
  description: z.string(),
  offer: z.string(),
  industry: z.string(),
  audience: z.string(),
  geography: z.string(),
  objective: z.string(),
  tone: z.string(),
  platform: z.string(),
});

export type CampaignBrief = z.infer<typeof CampaignBriefSchema>;

export const AdCopyVariantsSchema = z.object({
  metaAds: z.array(z.object({
    headline: z.string(),
    primaryText: z.string(),
    cta: z.string()
  })),
  googleAds: z.array(z.object({
    headline: z.string(),
    description: z.string()
  }))
});

export type AdCopyVariants = z.infer<typeof AdCopyVariantsSchema>;

export class AiCopyService {
  /**
   * Generates Ad Copy variants based on the campaign brief
   */
  static async generateVariants(brief: CampaignBrief): Promise<AdCopyVariants> {
    const prompt = `
      You are an expert digital marketing copywriter. Generate high-converting ad copy for Meta Ads and Google Ads based on the following brief:

      Product/Service: ${brief.productName}
      Description: ${brief.description}
      Offer: ${brief.offer}
      Industry: ${brief.industry}
      Target Audience: ${brief.audience}
      Geography: ${brief.geography}
      Campaign Objective: ${brief.objective}
      Tone of Voice: ${brief.tone}

      Output strictly in JSON format matching this structure:
      {
        "metaAds": [{ "headline": "", "primaryText": "", "cta": "" }],
        "googleAds": [{ "headline": "", "description": "" }]
      }

      Generate 3 variations for Meta Ads (Headline, Primary Text, CTA).
      Generate 3 variations for Google Ads (Headline, Description).
    `;

    const result = await AIService.generateJSON<AdCopyVariants>({
      messages: [
        { role: 'system', content: 'You are an expert digital marketing copywriter.' },
        { role: 'user', content: prompt }
      ]
    });

    return result;
  }
}
