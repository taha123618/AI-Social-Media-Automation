import { z } from "zod";
import { ContentIntent, Platform } from "@/app/generated/prisma/client";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { VectorService } from "@/features/knowledge/services/vector.service";
import prisma from "@/lib/prisma";

// Zod schema for AI output validation
const ContentOutputSchema = z.object({
  caption: z.string().min(1).max(2200), // Reasonable limit for most platforms
  visual_prompt: z.string().min(10).max(500),
  suggested_hashtags: z.array(z.string().min(1)).max(30),
  call_to_action: z.string().optional(),
});

export type GeneratedContent = z.infer<typeof ContentOutputSchema>;

// Input validation schema
const GenerateContentInputSchema = z.object({
  businessId: z.string(),
  creatorId: z.string(),
  intent: z.nativeEnum(ContentIntent),
  platforms: z.array(z.nativeEnum(Platform)).min(1),
  topic: z.string().optional(),
  customInstructions: z.string().optional(),
});

export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

export class ContentGenerator {
  /**
   * Main entry point to generate content using RAG pipeline
   */
  static async generateContent(input: GenerateContentInput): Promise<{
    content: GeneratedContent;
    contextUsed: {
      brandContext: string;
      retrievedKnowledge: Array<{ content: string; similarity: number }>;
      systemPrompt: string;
      userPrompt: string;
    };
  }> {
    // Validate input
    const validatedInput = GenerateContentInputSchema.parse(input);

    // 1. Gather Context using RAG
    const { brandContext, retrievedKnowledge } = await this.gatherContext(
      validatedInput.businessId,
      validatedInput.creatorId,
      validatedInput.topic
    );

    // 2. Build prompts
    const systemPrompt = this.buildSystemPrompt(brandContext, retrievedKnowledge);
    const userPrompt = this.buildUserPrompt(validatedInput);

    // 3. Generate content (mock for now, will integrate with OpenAI)
    const generatedContent = await this.callAI(systemPrompt, userPrompt);

    // 4. Validate output
    const validatedContent = ContentOutputSchema.parse(generatedContent);

    return {
      content: validatedContent,
      contextUsed: {
        brandContext,
        retrievedKnowledge,
        systemPrompt,
        userPrompt
      }
    };
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

    // Get top performing posts for few-shot learning (Phase 2 feature)
    const topPosts = await this.getTopPerformingPosts(businessId);

    // Search knowledge base for relevant information
    const searchQuery = topic ?
      `${topic} ${profile.tone || ''} ${profile.industry || ''}` :
      `${profile.tone || 'brand'} ${profile.industry || 'business'} mission vision values`;

    const knowledgeResults = await VectorService.similaritySearch(
      businessId,
      searchQuery,
      5, // limit
      0.7 // minimum similarity
    );

    // Format retrieved knowledge
    const retrievedKnowledge = knowledgeResults.map(result => ({
      content: result.content,
      similarity: result.similarity
    }));

    // Build comprehensive brand context
    const brandContextParts = [
      `BUSINESS ID: ${businessId}`,
      profile.mission ? `MISSION: ${profile.mission}` : null,
      profile.vision ? `VISION: ${profile.vision}` : null,
      profile.usp ? `USP: ${profile.usp}` : null,
      profile.brandTone ? `BRAND TONE: ${profile.brandTone}` : null,
      profile.targetAudience ? `TARGET AUDIENCE: ${profile.targetAudience}` : null,
      profile.forbiddenWords?.length ? `FORBIDDEN TERMS: ${Array.isArray(profile.forbiddenWords) ? profile.forbiddenWords.join(", ") : profile.forbiddenWords}` : null,
      topPosts.length > 0 ? `SUCCESSFUL POST PATTERNS:\n${topPosts.map(p => `- ${p.caption.substring(0, 100)}...`).join('\n')}` : null
    ];

    const brandContext = brandContextParts.filter(Boolean).join("\n\n");

    return {
      brandContext,
      retrievedKnowledge
    };
  }

  /**
   * Build system prompt with safety guardrails
   */
  private static buildSystemPrompt(
    brandContext: string,
    retrievedKnowledge: Array<{ content: string; similarity: number }>
  ): string {
    const knowledgeSection = retrievedKnowledge.length > 0 ?
      `RELEVANT BRAND KNOWLEDGE:\n${retrievedKnowledge.map((k, i) =>
        `${i + 1}. ${k.content.substring(0, 300)}... (confidence: ${(k.similarity * 100).toFixed(1)}%)`
      ).join('\n\n')}` :
      "NO SPECIFIC BRAND KNOWLEDGE FOUND FOR THIS TOPIC.";

    return `
You are an elite Social Media Strategist and Copywriter for a brand.
Your goal is to generate high-performing content that strictly aligns with the brand's identity.

--- BRAND CONTEXT ---
${brandContext}

${knowledgeSection}

--- SAFETY GUARDRAILS ---
1. ONLY use facts provided in the brand context and retrieved knowledge
2. NEVER hallucinate products, services, or facts the business doesn't actually offer
3. STRICTLY avoid any forbidden terms
4. MAINTAIN the specified brand tone consistently
5. ENSURE all content is authentic and truthful

--- RESPONSE FORMAT ---
You must output a valid JSON object with the following structure:
{
  "caption": "The main post caption/content optimized for the platform(s). Use appropriate emojis and formatting.",
  "visual_prompt": "A detailed prompt for generating visuals (images/videos) - be specific about style, composition, and mood",
  "suggested_hashtags": ["#relevant", "#hashtags", "#for", "#discovery"],
  "call_to_action": "Optional but recommended - clear action you want the audience to take"
}
    `.trim();
  }

  /**
   * Build user prompt with specific instructions
   */
  private static buildUserPrompt(params: GenerateContentInput): string {
    const platformGuidelines = params.platforms.map(platform => {
      const platformStr = typeof platform === 'string' ? platform : Platform[platform as keyof typeof Platform];

      if (platformStr === "TWITTER") {
        return "Twitter: Max 280 characters, punchy, 2-3 hashtags max, thread-friendly";
      } else if (platformStr === "LINKEDIN") {
        return "LinkedIn: Professional tone, value-driven, use line breaks, deeper analysis welcome";
      } else if (platformStr === "INSTAGRAM") {
        return "Instagram: Visual-first, engaging caption, storytelling approach, hashtag use encouraged";
      } else if (platformStr === "FACEBOOK") {
        return "Facebook: Community-focused, conversational, longer-form acceptable";
      } else if (platformStr === "TIKTOK") {
        return "TikTok: Trend-aware, casual, hook-focused, entertainment value";
      } else if (platformStr === "YOUTUBE") {
        return "YouTube: Educational/informational, detailed description, SEO-optimized";
      } else {
        return `${platformStr}: General social media best practices`;
      }
    }).join("\n");

    const intentGuidance = {
      [ContentIntent.SALES]: "Focus on conversion, clear benefits, urgency. Strong CTA required.",
      [ContentIntent.EDUCATION]: "Value-focused, teaching mindset, establish authority. CTA: 'Save for later' or 'Share'.",
      [ContentIntent.EVENT]: "Create excitement, FOMO, clear dates/details. CTA: 'Register now' or 'RSVP'.",
      [ContentIntent.ENGAGEMENT]: "Ask questions, encourage interaction, relate to trending topics.",
      [ContentIntent.BRAND_AWARENESS]: "Storytelling, mission/values, emotional connection without hard selling."
    }[params.intent];

    return `
TASK: Generate a social media post.

SPECIFICATIONS:
- Topic: ${params.topic || "General brand update"}
- Intent: ${params.intent} - ${intentGuidance}
- Platforms: ${params.platforms.join(", ")}
- Custom Instructions: ${params.customInstructions || "None provided"}

PLATFORM GUIDELINES:
${platformGuidelines}

REQUIREMENTS:
1. Caption should be engaging and platform-appropriate
2. Visual prompt should be detailed enough for AI image/video generation
3. Hashtags should be relevant and discoverable
4. Call-to-action should match the intent
5. Respect ALL brand guidelines from the system prompt

Generate the content now in valid JSON format.
    `.trim();
  }

  /**
   * Mock AI call - will be replaced with actual OpenAI integration
   */
  private static async callAI(systemPrompt: string, userPrompt: string): Promise<GeneratedContent> {
    // In production, this would call OpenAI API
    // For now, we'll simulate realistic output

    console.log("--- SYSTEM PROMPT ---\n", systemPrompt.substring(0, 500) + "...");
    console.log("--- USER PROMPT ---\n", userPrompt);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock content based on the prompts
    return {
      caption: "🚀 Exciting news! We're launching something incredible that aligns perfectly with our mission to [mission statement]. This represents our commitment to [core value] and demonstrates why we're the [USP/differentiator] in the [industry] space.\n\nStay tuned for the big reveal! 👀 #Innovation #FutureReady #[Industry]",
      visual_prompt: "Modern minimalist office space with diverse team collaborating around a digital screen showing innovative technology interface, warm professional lighting, clean aesthetic, corporate branding colors, shot with Canon EOS R5, f/2.8, ISO 400",
      suggested_hashtags: ["#Innovation", "#Tech", "#Future", "#Teamwork", "#Success"],
      call_to_action: "Follow for the big announcement tomorrow!"
    };
  }

  /**
   * Get top performing posts for few-shot learning (Phase 2 feature)
   */
  private static async getTopPerformingPosts(businessId: string, limit: number = 3): Promise<Array<{ caption: string; engagementRate: number }>> {
    try {
      // This will be enhanced in Phase 2 with real analytics data
      const topPosts = await prisma.post.findMany({
        where: {
          businessId,
          status: "POSTED"
        },
        include: {
          draft: true
        },
        orderBy: {
          likes: "desc"
        },
        take: limit
      });

      return topPosts
        .map(post => {
          const content = (post.draft?.contentJson as any) || {};
          const impressions = Math.max(post.impressions, 1);
          const engagement = (post.likes || 0) + (post.shares || 0) + (post.comments || 0);
          return {
            caption: content.caption || content.text || (post.draft?.content as string) || "",
            engagementRate: (engagement / impressions) * 100
          };
        })
        .sort((a, b) => b.engagementRate - a.engagementRate);
    } catch (error) {
      console.warn("Could not fetch top performing posts:", error);
      return []; // Return empty array if analytics aren't available yet
    }
  }

  /**
   * Save generated content as a draft
   */
  static async saveAsDraft(input: GenerateContentInput): Promise<{ draftId: string }> {
    const result = await this.generateContent(input);

    const draft = await prisma.contentDraft.create({
      data: {
        businessId: input.businessId,
        creatorId: input.creatorId,
        intent: input.intent,
        platforms: input.platforms,
        title: input.topic ? `Generated: ${input.topic}` : "AI Generated Content",
        customPrompt: input.customInstructions,
        contextUsed: result.contextUsed,
        contentJson: result.content as any,
        status: "GENERATED"
      }
    });

    return { draftId: draft.id };
  }


}