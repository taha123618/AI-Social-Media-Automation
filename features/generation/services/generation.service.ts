import { z } from "zod";
import { ContentIntent, Platform } from "@/app/generated/prisma/client";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { VectorService } from "@/features/knowledge/services/vector.service";
import { AIService } from "@/services/ai/ai.service";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// --- SCHEMAS ---

const VideoScriptSchema = z.object({
  hook: z.string().describe("0-3 seconds: High-impact visual/verbal hook"),
  body: z.string().describe("3-30 seconds: Narrative/Value delivery"),
  cta: z.string().describe("Final 5 seconds: Direct instruction"),
  durationSeconds: z.number().int().default(30),
});

const ContentOutputSchema = z.object({
  caption: z.string().min(1).max(2200),
  visualPrompt: z.string().min(10).max(1000).describe("Detailed prompt for DALL-E/Midjourney"),
  videoScript: VideoScriptSchema.optional(),
  hashtags: z.array(z.string()).max(30),
  cta: z.string().optional(),
});

export type GeneratedContent = z.infer<typeof ContentOutputSchema>;

export interface GenerationParams {
  intent: ContentIntent;
  platforms: Platform[];
  topic?: string;
  customInstructions?: string;
  workflowId?: string;
  executionId?: string;
}

// --- SERVICE ---

export class GenerationService {
  /**
   * Main entry point to generate content for a specific intent and platform
   */
  static async generateDraft(
    businessId: string,
    creatorId: string,
    params: GenerationParams & { draftId?: string }
  ) {
    console.log(`[GenerationService] Generating draft for business ${businessId}...`);

    // 1. Fetch raw business profile for snaps
    const profile = await KnowledgeService.getProfile(businessId, creatorId);

    // 2. Gather Context (RAG + Profile + Summaries)
    const { brandContext, retrievedKnowledge } = await this.gatherContext(
      businessId,
      creatorId,
      params.topic
    );

    // 3. Build Prompts
    const systemPrompt = this.buildSystemPrompt(brandContext, retrievedKnowledge);
    const userPrompt = this.buildUserPrompt(params);

    let content: GeneratedContent;

    try {
      // 4. Call AI with Structured Output using AIService
      const response = await AIService.generateJSON<GeneratedContent>({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      });

      content = ContentOutputSchema.parse(response);

      // 5. Uniqueness validation via ContentUniquenessLog SHA256 hashes
      const contentHash = crypto.createHash("sha256").update(content.caption).digest("hex");
      const duplicate = await prisma.contentUniquenessLog.findFirst({
        where: { businessId, contentHash }
      });

      if (duplicate) {
        console.log(`[GenerationService] Duplicate content detected (hash: ${contentHash}). Re-generating unique variant...`);
        const retryResponse = await AIService.generateJSON<GeneratedContent>({
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `${userPrompt}\n\nSTRICT REWRITE REQUIRED: The previous draft matched an existing post exactly. Write an entirely new, fresh, unique variant of this post. Change the structure, vocabulary, and platforms angle completely to ensure originality.` 
            }
          ],
          temperature: 0.95, // Higher temp to maximize variety
        });
        content = ContentOutputSchema.parse(retryResponse);
      }
    } catch (error) {
      console.error("[GenerationService] AI generation failed or was rejected:", error);
      content = this.getFallbackContent(params, brandContext);
    }

    let finalDraft;

    // 6. Save/Update Draft in DB
    if (params.draftId) {
      finalDraft = await prisma.contentDraft.update({
        where: { id: params.draftId },
        data: {
          intent: params.intent,
          platforms: params.platforms,
          customPrompt: params.customInstructions,
          contextUsed: {
            brandContextSummary: brandContext,
            retrievedKnowledgeCount: retrievedKnowledge.length,
            systemPrompt,
            userPrompt
          },
          contentJson: content as any,
          content: content.caption,
          visualPrompt: content.visualPrompt,
          videoScript: content.videoScript as any,
          status: "GENERATED",
          assetStatus: content.visualPrompt || content.videoScript ? "PENDING" : "COMPLETED",
          workflowId: params.workflowId,
          executionId: params.executionId
        }
      });
    } else {
      finalDraft = await prisma.contentDraft.create({
        data: {
          businessId,
          creatorId,
          intent: params.intent,
          platforms: params.platforms,
          customPrompt: params.customInstructions,
          contextUsed: {
            brandContextSummary: brandContext,
            retrievedKnowledgeCount: retrievedKnowledge.length,
            systemPrompt,
            userPrompt
          },
          contentJson: content as any,
          content: content.caption,
          visualPrompt: content.visualPrompt,
          videoScript: content.videoScript as any,
          status: "GENERATED",
          assetStatus: content.visualPrompt || content.videoScript ? "PENDING" : "COMPLETED",
          workflowId: params.workflowId,
          executionId: params.executionId
        }
      });
    }

    // 7. Log to ContentUniquenessLog
    try {
      const finalHash = crypto.createHash("sha256").update(content.caption).digest("hex");
      await prisma.contentUniquenessLog.create({
        data: {
          businessId,
          contentHash: finalHash,
          contentDraftId: finalDraft.id,
          platform: params.platforms[0] || "ALL",
          contentPreview: content.caption.substring(0, 150)
        }
      });
    } catch (e) {
      console.error("[GenerationService] Failed to log uniqueness hash:", e);
    }

    // 8. Log full context snapshots to ContentGenerationContext
    try {
      await prisma.contentGenerationContext.create({
        data: {
          contentDraftId: finalDraft.id,
          businessId,
          businessProfileSnapshot: profile as any,
          generationPrompt: userPrompt,
          generationParameters: {
            intent: params.intent,
            platforms: params.platforms,
            customInstructions: params.customInstructions,
            topic: params.topic
          } as any,
          modelUsed: "openai/gpt-4-turbo",
        }
      });
    } catch (e) {
      console.error("[GenerationService] Failed to log context snapshot:", e);
    }

    return finalDraft;
  }

  /**
   * Gather brand context and relevant knowledge using RAG
   */
  private static async gatherContext(
    businessId: string,
    creatorId: string,
    topic?: string
  ): Promise<{
    brandContext: string;
    retrievedKnowledge: Array<{ content: string; similarity: number }>;
  }> {
    // Get business profile
    const profile = await KnowledgeService.getProfile(businessId, creatorId);
    if (!profile) {
      throw new Error(`Business profile not found for business: ${businessId}`);
    }

    // Check for approved AI Brand Summaries
    const approvedSummary = await KnowledgeService.getApprovedSummary(businessId);
    let brandDNASection = "";
    if (approvedSummary) {
      brandDNASection = `
APPROVED BRAND DNA:
- Elevator Pitch: ${approvedSummary.elevatorPitch}
- Short Summary: ${approvedSummary.shortSummary}
- Detailed Overview: ${approvedSummary.detailedOverview}
- Marketing Positioning: ${approvedSummary.marketingPositioning}
      `.trim();
    }

    // Get top performing posts for few-shot learning
    const topPosts = await this.getTopPerformingPosts(businessId);

    // Search knowledge base for relevant information
    const searchQuery = topic ?
      `${topic} ${profile.tone || ''} ${profile.industry || ''}` :
      `${profile.tone || 'brand'} ${profile.industry || 'business'} mission vision values`;

    const knowledgeResults = await VectorService.similaritySearch(
      businessId,
      searchQuery,
      5, // limit
      0.65 // minimum similarity
    );

    const retrievedKnowledge = knowledgeResults.map(result => ({
      content: result.content,
      similarity: result.similarity
    }));

    // Build comprehensive brand context
    const brandContextParts = [
      brandDNASection ? brandDNASection : null,
      `MISSION: ${profile.mission || 'Not specified'}`,
      `VISION: ${profile.vision || 'Not specified'}`,
      `TAGLINE: ${profile.tagline || 'Not specified'}`,
      `SLOGAN: ${profile.slogan || 'Not specified'}`,
      `UVP/USP: ${profile.uniqueValueProposition || profile.usp || profile.uvp || 'Not specified'}`,
      `BUSINESS MODEL: ${profile.businessModel || 'Not specified'}`,
      profile.coreValues && profile.coreValues.length > 0 ? `CORE VALUES: ${profile.coreValues.join(", ")}` : null,
      profile.geographicMarkets && profile.geographicMarkets.length > 0 ? `GEOGRAPHIC MARKETS: ${profile.geographicMarkets.join(", ")}` : null,
      profile.keyBenefits && profile.keyBenefits.length > 0 ? `KEY BENEFITS: ${profile.keyBenefits.join(", ")}` : null,
      profile.competitiveAdvantages && profile.competitiveAdvantages.length > 0 ? `COMPETITIVE ADVANTAGES: ${profile.competitiveAdvantages.join(", ")}` : null,
      `BRAND TONE: ${profile.brandTone || profile.tone || 'Professional'}`,
      `TARGET AUDIENCE: ${profile.targetAudience || 'General'}`,
      profile.productsServices ? `OFFERED PRODUCTS & SERVICES (STRICT RAG LIMIT): ${JSON.stringify(profile.productsServices)}` : null,
      Array.isArray(profile.forbiddenWords) && profile.forbiddenWords.length > 0 ? `FORBIDDEN TERMS: ${profile.forbiddenWords.join(", ")}` : null,
      topPosts.length > 0 ? `SUCCESSFUL POST EXAMPLES:\n${topPosts.map(p => `- ${p.caption.substring(0, 150)}...`).join('\n')}` : null
    ];

    const brandContext = brandContextParts.filter(Boolean).join("\n\n");

    return {
      brandContext,
      retrievedKnowledge
    };
  }

  private static buildSystemPrompt(
    brandContext: string,
    retrievedKnowledge: Array<{ content: string; similarity: number }>
  ): string {
    const knowledgeSection = retrievedKnowledge.length > 0 ?
      `RELEVANT KNOWLEDGE CHUNKS:\n${retrievedKnowledge.map((k, i) =>
        `${i + 1}. ${k.content}`
      ).join('\n\n')}` :
      "NO SPECIFIC KNOWLEDGE FOUND IN DOCUMENTS.";

    return `
You are a Senior Social Media Strategist and Expert Copywriter.
Your goal is to transform brand knowledge into high-impact social media content.

--- BRAND IDENTITY & DNA ---
${brandContext}

--- SUPPLEMENTAL KNOWLEDGE ---
${knowledgeSection}

--- CONTENT PHILOSOPHY ---
1. **NO CLICHÉS**: Strictly avoid generic AI phrases like "Buckle up," "Game-changer," "Unlock your potential," "In today's digital landscape," or "Elevate your journey."
2. **HUMAN-CENTRIC**: Write as if you are a passionate human expert. Use punchy sentences, varied rhythm, and authentic emotion.
3. **VALUE-FIRST**: Every post must offer a "Reason to Care" (benefit) or a "Reason to Know" (insight).
4. **PLATFORM NATIVE**: Respect the culture and technical constraints of each platform.
5. **STRICT COMPLIANCE**: Never hallucinate services or offer products that are not explicitly documented in the "OFFERED PRODUCTS & SERVICES" list above.
6. **FORBIDDEN TERMS**: Strictly ensure none of the terms listed under "FORBIDDEN TERMS" (if any) are present in your generated text.

--- RESPONSE SPECIFICATION ---
You MUST output ONLY a valid JSON object in this format:
{
  "caption": "The main post caption. Optimize for readability with line breaks.",
  "visualPrompt": "A professional, photorealistic DALL-E 3 prompt describing a high-quality visual.",
  "videoScript": {
    "hook": "0-3 seconds high-impact hook",
    "body": "Narrative delivery",
    "cta": "Direct instruction",
    "durationSeconds": 30
  },
  "hashtags": ["#specific", "#relevant"],
  "cta": "The primary call to action string."
}
    `.trim();
  }

  /**
   * Generate content recommendations based on successful posts
   */
  static async generateContentRecommendations(params: {
    businessId: string;
    successfulContent: string;
    platform: string;
    metrics: {
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
      clicks: number;
    } | null;
  }) {
    const recommendations = [
      `Try a follow-up post expanding on "${params.successfulContent.substring(0, 30)}..."`,
      `Share a "behind the scenes" look related to this successful ${params.platform} post`,
      `Create a poll to engage your audience further about this topic`,
    ];

    return recommendations;
  }

  private static buildUserPrompt(params: GenerationParams) {
    const platformSpecs = params.platforms.map(p => {
      switch (p) {
        case Platform.TWITTER: return "- TWITTER (X): Max 280 chars. 1-2 hashtags. Radical brevity. Use a hook in the first 80 chars.";
        case Platform.LINKEDIN: return "- LINKEDIN: Professional yet personal. Use 'Return' keys for readability. Educational or thought-leadership style.";
        case Platform.INSTAGRAM: return "- INSTAGRAM: Lifestyle and aesthetic focus. Use 3-5 relevant emojis. 5-10 hashtags.";
        case Platform.TIKTOK: return "- TIKTOK: Trend-aware, fast-paced, high energy. Hook is critical.";
        case Platform.FACEBOOK: return "- FACEBOOK: Community-driven, storytelling, conversational.";
        default: return `- ${p}: Optimize for highest engagement patterns on this platform.`;
      }
    }).join("\n");

    const intentStrategy = {
      [ContentIntent.SALES]: "STRATEGY: SALES/CONVERSION. Focus on high conversion. Highlight a customer pain point, present our core UVP, list unique key benefits, create urgency/scarcity, and include a clear, direct CTA.",
      [ContentIntent.EDUCATION]: "STRATEGY: EDUCATIONAL/AUTHORITY. Focus on authority. Teach the audience an actionable 'How-to' tip or share a valuable industry insight. Maintain an expert teaching mindset and STRICTLY avoid hard sales words or direct sales pitches.",
      [ContentIntent.EVENT]: "STRATEGY: EVENT/URGENCY. Promote a workshop, corporate event, holiday, launch date, or brand event. Highlight relevant dates, event scope, and encourage participation with urgency.",
      [ContentIntent.ENGAGEMENT]: "STRATEGY: INTERACTION. Ask an engaging question or trigger a discussion to spark comments and shares.",
      [ContentIntent.BRAND_AWARENESS]: "STRATEGY: TRUST/IDENTITY. Share a core brand value story, tagline history, or mission alignment to build long-term trust."
    }[params.intent];

    return `
GENERATE CONTENT FOR: ${params.topic || "Current Industry Trends"}
INTENT: ${params.intent}
PLATFORMS: ${params.platforms.join(", ")}

TARGET STRATEGY: ${intentStrategy}

PLATFORM CONSTRAINTS:
${platformSpecs}

ADDITIONAL CUSTOM CONTEXT: ${params.customInstructions || "None."}

Generate the JSON now:
    `.trim();
  }

  private static async getTopPerformingPosts(businessId: string, limit: number = 2): Promise<Array<{ caption: string }>> {
    try {
      const topPosts = await prisma.post.findMany({
        where: { businessId, status: "POSTED" },
        include: { draft: true },
        orderBy: { likes: "desc" },
        take: limit
      });

      return topPosts.map(post => {
        const json = (post.draft?.contentJson as any) || {};
        return {
          caption: json.caption || json.text || (post.draft?.content as string) || ""
        };
      }).filter(p => p.caption.length > 0);
    } catch (error) {
      return [];
    }
  }

  private static getFallbackContent(params: GenerationParams, brandContext: string): GeneratedContent {
    return {
      caption: `🚀 Preparing something special about ${params.topic || "our latest updates"}! Stay tuned for more insights from ${brandContext.substring(0, 30)}...`,
      visualPrompt: `Professional social media graphic showing ${params.topic || "innovation and growth"}, modern aesthetic, high resolution.`,
      hashtags: ["#innovation", "#brand"],
      cta: "Follow for more!"
    };
  }
}
