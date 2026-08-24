import prisma from "@/lib/prisma";
import { z } from "zod";
import pgvector from 'pgvector';
import { BrandTone, BusinessModel, TonePreference, BusinessProfileInput } from '../types';
import { VectorService } from "./vector.service";
import { AIService } from "@/services/ai/ai.service";
import { SchedulerService } from "@/features/scheduler/services/scheduler.service";
import { SystemLogger } from "@/features/system/services/logger.service";
import { AppError, ErrorCode } from "@/lib/error-handler";

// Type for raw query results from similarity search
type KnowledgeChunkResult = {
  id: string;
  content: string;
  distance: number;
};

export const BusinessProfileSchema = z.object({
  mission: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
  uvp: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  tone: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  forbiddenWords: z.array(z.string()).optional(),
  brandTone: z.nativeEnum(BrandTone).optional().nullable(),
  usp: z.string().optional().nullable(),
  colorPalette: z.array(z.string()).optional().nullable(),
  watermark: z.string().optional().nullable(),
  
  // Extended fields for Business Knowledge Module
  tagline: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  coreValues: z.array(z.string()).optional(),
  uniqueValueProposition: z.string().optional().nullable(),
  businessModel: z.nativeEnum(BusinessModel).optional().nullable(),
  geographicMarkets: z.array(z.string()).optional(),
  targetAudienceDetails: z.any().optional().nullable(),
  productsServices: z.any().optional().nullable(),
  keyBenefits: z.array(z.string()).optional(),
  competitiveAdvantages: z.array(z.string()).optional(),
  tonePreferences: z.array(z.nativeEnum(TonePreference)).optional()
});

// Input type that accepts both string (comma-separated) and array for array fields
export const BusinessProfileInputSchema = z.object({
  mission: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
  uvp: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  tone: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  forbiddenWords: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  brandTone: z.nativeEnum(BrandTone).optional().nullable(),
  usp: z.string().optional().nullable(),
  colorPalette: z.array(z.string()).optional().nullable(),
  watermark: z.string().optional().nullable(),
  
  // Extended fields for Business Knowledge Module
  tagline: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  coreValues: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  uniqueValueProposition: z.string().optional().nullable(),
  businessModel: z.nativeEnum(BusinessModel).optional().nullable(),
  geographicMarkets: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  targetAudienceDetails: z.any().optional().nullable(),
  productsServices: z.any().optional().nullable(),
  keyBenefits: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  competitiveAdvantages: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  tonePreferences: z.array(z.nativeEnum(TonePreference)).optional().nullable()
});

export type BusinessProfileData = z.infer<typeof BusinessProfileSchema>;

export class KnowledgeService {
  /**
   * Verify user has access to the business
   */
  static async verifyBusinessAccess(businessId: string, userId: string): Promise<void> {
    const membership = await prisma.businessMember.findUnique({
      where: {
        userId_businessId: { userId, businessId }
      }
    });

    if (!membership) {
      throw new AppError('Access denied to business data', ErrorCode.FORBIDDEN, 403);
    }
  }

  /**
   * Helper to normalize dynamic comma-separated inputs or arrays into proper arrays
   */
  private static parseArrayField(val: string | string[] | undefined | null): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(',').map(w => w.trim()).filter(Boolean);
  }

  /**
   * Get or create the business profile
   */
  static async getProfile(businessId: string, userId: string): Promise<BusinessProfileInput | null> {
    // Verify user authorization
    await this.verifyBusinessAccess(businessId, userId);

    const profile = await prisma.businessProfile.findUnique({
      where: { businessId },
    });

    if (!profile) {
      // Auto-initialize if not exists
      const newProfile = await prisma.businessProfile.create({
        data: { businessId },
      });
      return {
        mission: newProfile.mission,
        vision: newProfile.vision,
        uvp: newProfile.uvp,
        targetAudience: newProfile.targetAudience,
        tone: newProfile.tone,
        industry: newProfile.industry,
        colorPalette: Array.isArray(newProfile.colorPalette) ? newProfile.colorPalette as string[] : null,
        forbiddenWords: this.parseArrayField(newProfile.forbiddenWords),
        brandTone: newProfile.brandTone,
        usp: newProfile.usp,
        watermark: newProfile.watermark,
        tagline: newProfile.tagline,
        slogan: newProfile.slogan,
        coreValues: this.parseArrayField(newProfile.coreValues),
        uniqueValueProposition: newProfile.uniqueValueProposition,
        businessModel: newProfile.businessModel,
        geographicMarkets: this.parseArrayField(newProfile.geographicMarkets),
        targetAudienceDetails: newProfile.targetAudienceDetails,
        productsServices: newProfile.productsServices,
        keyBenefits: this.parseArrayField(newProfile.keyBenefits),
        competitiveAdvantages: this.parseArrayField(newProfile.competitiveAdvantages),
        tonePreferences: newProfile.tonePreferences as TonePreference[],
      };
    }

    return {
      mission: profile.mission,
      vision: profile.vision,
      uvp: profile.uvp,
      targetAudience: profile.targetAudience,
      tone: profile.tone,
      industry: profile.industry,
      colorPalette: Array.isArray(profile.colorPalette) ? profile.colorPalette as string[] : null,
      forbiddenWords: this.parseArrayField(profile.forbiddenWords),
      brandTone: profile.brandTone,
      usp: profile.usp,
      watermark: profile.watermark,
      tagline: profile.tagline,
      slogan: profile.slogan,
      coreValues: this.parseArrayField(profile.coreValues),
      uniqueValueProposition: profile.uniqueValueProposition,
      businessModel: profile.businessModel,
      geographicMarkets: this.parseArrayField(profile.geographicMarkets),
      targetAudienceDetails: profile.targetAudienceDetails,
      productsServices: profile.productsServices,
      keyBenefits: this.parseArrayField(profile.keyBenefits),
      competitiveAdvantages: this.parseArrayField(profile.competitiveAdvantages),
      tonePreferences: profile.tonePreferences as TonePreference[],
    };
  }

  /**
   * Update the business knowledge profile & record in audit versioning trail
   */
  static async updateProfile(businessId: string, userId: string, data: BusinessProfileInput) {
    // Verify user authorization
    await this.verifyBusinessAccess(businessId, userId);
    // Validate input using the flexible schema
    const validatedInput = BusinessProfileInputSchema.parse(data);

    // Transform to the internal schema format
    const validated: BusinessProfileData = {
      mission: validatedInput.mission,
      vision: validatedInput.vision,
      uvp: validatedInput.uvp,
      targetAudience: validatedInput.targetAudience,
      tone: validatedInput.tone,
      industry: validatedInput.industry,
      forbiddenWords: this.parseArrayField(validatedInput.forbiddenWords),
      brandTone: validatedInput.brandTone,
      usp: validatedInput.usp,
      colorPalette: validatedInput.colorPalette,
      watermark: validatedInput.watermark,
      tagline: validatedInput.tagline,
      slogan: validatedInput.slogan,
      coreValues: this.parseArrayField(validatedInput.coreValues),
      uniqueValueProposition: validatedInput.uniqueValueProposition,
      businessModel: validatedInput.businessModel,
      geographicMarkets: this.parseArrayField(validatedInput.geographicMarkets),
      targetAudienceDetails: validatedInput.targetAudienceDetails,
      productsServices: validatedInput.productsServices,
      keyBenefits: this.parseArrayField(validatedInput.keyBenefits),
      competitiveAdvantages: this.parseArrayField(validatedInput.competitiveAdvantages),
      tonePreferences: validatedInput.tonePreferences || []
    };

    // Load existing profile to compute diff for audit trail
    const existing = await prisma.businessProfile.findUnique({
      where: { businessId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1
        }
      }
    });

    const result = await prisma.businessProfile.upsert({
      where: { businessId },
      update: validated as any,
      create: {
        businessId,
        ...(validated as any),
      },
    });

    // Record change diff in audit trail if differences exist
    if (existing) {
      const changes: Record<string, { from: any; to: any }> = {};
      for (const [key, value] of Object.entries(validated)) {
        const oldValue = (existing as any)[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
          changes[key] = { from: oldValue, to: value };
        }
      }

      if (Object.keys(changes).length > 0) {
        const nextVersion = (existing.versions[0]?.versionNumber || 0) + 1;
        await prisma.businessProfileVersion.create({
          data: {
            businessProfileId: existing.id,
            versionNumber: nextVersion,
            changes: changes as any,
            changedBy: userId,
            reason: "Manual profile update"
          }
        });
      }
    }

    await SystemLogger.logActivity({
      action: "KNOWLEDGE_PROFILE_UPDATED",
      entity: "BusinessProfile",
      userId,
      details: { businessId, changes: Object.keys(data) }
    });

    return result;
  }

  /**
   * Rollback BusinessProfile to a previous version in the audit trail
   */
  static async rollbackProfileVersion(businessId: string, userId: string, versionNumber: number) {
    await this.verifyBusinessAccess(businessId, userId);

    const profile = await prisma.businessProfile.findUnique({
      where: { businessId },
      include: {
        versions: {
          where: { versionNumber }
        }
      }
    });

    if (!profile || profile.versions.length === 0) {
      throw new AppError("Requested version not found for this profile", ErrorCode.RESOURCE_NOT_FOUND, 404);
    }

    const version = profile.versions[0];
    const changes = version.changes as Record<string, { from: any; to: any }>;

    // Revert properties back to their original 'from' states
    const rollbackData: Record<string, any> = {};
    for (const [key, val] of Object.entries(changes)) {
      rollbackData[key] = val.from;
    }

    const updated = await prisma.businessProfile.update({
      where: { businessId },
      data: rollbackData
    });

    // Write a new rollback tracking version record
    const lastVersionNumRecord = await prisma.businessProfileVersion.findFirst({
      where: { businessProfileId: profile.id },
      orderBy: { versionNumber: "desc" }
    });
    const nextVersion = (lastVersionNumRecord?.versionNumber || 0) + 1;

    await prisma.businessProfileVersion.create({
      data: {
        businessProfileId: profile.id,
        versionNumber: nextVersion,
        changes: { rollbackTarget: versionNumber, rolledBackFields: Object.keys(changes) } as any,
        changedBy: userId,
        reason: `Rolled back to version ${versionNumber}`
      }
    });

    await SystemLogger.logActivity({
      action: "KNOWLEDGE_PROFILE_ROLLED_BACK",
      entity: "BusinessProfile",
      userId,
      details: { businessId, versionNumber }
    });

    return updated;
  }

  /**
   * Get all available profile versions in audit trail
   */
  static async getProfileVersions(businessId: string, userId: string) {
    await this.verifyBusinessAccess(businessId, userId);
    const profile = await prisma.businessProfile.findUnique({
      where: { businessId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" }
        }
      }
    });
    return profile?.versions || [];
  }

  /**
   * Quality Control Check: Validate profile completeness & flag brand inconsistencies
   */
  static async validateProfileCompleteness(businessId: string, userId: string) {
    await this.verifyBusinessAccess(businessId, userId);

    const profile = await prisma.businessProfile.findUnique({
      where: { businessId }
    });

    if (!profile) {
      return {
        complete: false,
        missingFields: ["profile_not_initialized"],
        conflicts: []
      };
    }

    const missingFields: string[] = [];
    if (!profile.mission) missingFields.push("mission");
    if (!profile.vision) missingFields.push("vision");
    if (!profile.tagline) missingFields.push("tagline");
    if (!profile.uniqueValueProposition) missingFields.push("uniqueValueProposition");
    if (!profile.targetAudience) missingFields.push("targetAudience");
    if (!profile.industry) missingFields.push("industry");
    
    const parsedProducts = Array.isArray(profile.productsServices) 
      ? profile.productsServices 
      : [];
    if (parsedProducts.length === 0) {
      missingFields.push("productsServices");
    }

    if (profile.coreValues.length === 0) {
      missingFields.push("coreValues");
    }

    // Semantic brand consistency checks & warnings
    const conflicts: string[] = [];
    
    if (profile.tonePreferences.includes(TonePreference.LUXURY) && profile.tonePreferences.includes(TonePreference.COMEDIC)) {
      conflicts.push("Contradictory Brand Tones: 'LUXURY' and 'COMEDIC' style rules are active simultaneously. This might cause the content generation engine to output inconsistent messaging.");
    }

    if (profile.businessModel === BusinessModel.B2B && profile.tonePreferences.includes(TonePreference.CASUAL) && !profile.tonePreferences.includes(TonePreference.PROFESSIONAL)) {
      conflicts.push("B2B Brand DNA Inconsistency: A B2B profile is set with only 'CASUAL' styling without a supporting 'PROFESSIONAL' guideline.");
    }

    return {
      complete: missingFields.length === 0,
      missingFields,
      conflicts
    };
  }

  /**
   * AI-Based Brand Summary Generation
   * Generates four distinct components:
   * - shortSummary: 50-100 words
   * - detailedOverview: 150-300 words
   * - elevatorPitch: 1-2 sentence hook
   * - marketingPositioning: brand positioning statement
   */
  static async generateAISummaries(businessId: string, userId: string) {
    await this.verifyBusinessAccess(businessId, userId);

    const profile = await prisma.businessProfile.findUnique({
      where: { businessId }
    });

    if (!profile) {
      throw new AppError("Business profile not found", ErrorCode.RESOURCE_NOT_FOUND, 404);
    }

    // Retrieve knowledge chunks to provide real contextual RAG support
    const topChunks = await this.searchKnowledgeChunks(businessId, "What is our company mission, vision, products, and target audience?", 10);
    const knowledgeText = topChunks.map(c => c.content).join("\n\n");

    const systemPrompt = `You are a world-class Elite Brand DNA Strategist.
Your goal is to parse raw business details and output a comprehensive brand strategy in JSON format.
You must generate exactly these four fields in the JSON response:
1. shortSummary: A highly dense, engaging summary of the brand in 50-100 words.
2. detailedOverview: A comprehensive brand overview explaining products, services, value props, and target audience in 150-300 words.
3. elevatorPitch: A punchy, modern hook in exactly 1-2 engaging sentences.
4. marketingPositioning: A positioning statement following standard frameworks (e.g. 'For [target audience] who [need], [Brand] is the [category] that [differentiator] because [proof].')

Strictly return only valid JSON parsing these fields. Do not include markdown code block backticks like \`\`\`json.`;

    const userPrompt = `
Here are the raw Brand DNA profile properties:
- Business Name: ${businessId}
- Tagline: ${profile.tagline || "Not specified"}
- Slogan: ${profile.slogan || "Not specified"}
- Mission: ${profile.mission || "Not specified"}
- Vision: ${profile.vision || "Not specified"}
- UVP: ${profile.uniqueValueProposition || "Not specified"}
- Industry: ${profile.industry || "Not specified"}
- Target Audience: ${profile.targetAudience || "Not specified"}
- Core Values: ${profile.coreValues.join(", ") || "Not specified"}
- Business Model: ${profile.businessModel || "Not specified"}
- Geographic Markets: ${profile.geographicMarkets.join(", ") || "Not specified"}
- Offered Products & Services: ${JSON.stringify(profile.productsServices) || "Not specified"}
- Key Benefits: ${profile.keyBenefits.join(", ") || "Not specified"}
- Competitive Advantages: ${profile.competitiveAdvantages.join(", ") || "Not specified"}

Knowledge Base Document Excerpts:
${knowledgeText}

Generate the Brand DNA summary now.`;

    try {
      const generated = await AIService.generateJSON<any>({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3
      });

      // Insert or update summary in database
      const summary = await prisma.businessSummary.upsert({
        where: { businessProfileId: profile.id },
        update: {
          shortSummary: generated.shortSummary || "",
          detailedOverview: generated.detailedOverview || "",
          elevatorPitch: generated.elevatorPitch || "",
          marketingPositioning: generated.marketingPositioning || "",
          isApproved: false,
          generatedBy: userId,
          generatedAt: new Date()
        },
        create: {
          businessProfileId: profile.id,
          shortSummary: generated.shortSummary || "",
          detailedOverview: generated.detailedOverview || "",
          elevatorPitch: generated.elevatorPitch || "",
          marketingPositioning: generated.marketingPositioning || "",
          isApproved: false,
          generatedBy: userId
        }
      });

      return summary;
    } catch (error) {
      console.error("AI Brand Summary Generation failed:", error);
      throw new Error(`AI Brand Summary Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Approve/Reject a generated business summary
   */
  static async approveSummary(businessId: string, userId: string, approve: boolean) {
    await this.verifyBusinessAccess(businessId, userId);

    const profile = await prisma.businessProfile.findUnique({
      where: { businessId },
      include: { summaries: true }
    });

    if (!profile || !profile.summaries) {
      throw new AppError("No generated summaries found for this brand.", ErrorCode.RESOURCE_NOT_FOUND, 404);
    }

    const summary = await prisma.businessSummary.update({
      where: { businessProfileId: profile.id },
      data: {
        isApproved: approve,
        approvedBy: userId,
        approvedAt: approve ? new Date() : null
      }
    });

    return summary;
  }

  /**
   * Manually override business summary properties
   */
  static async overrideSummary(
    businessId: string,
    userId: string,
    data: {
      shortSummary?: string;
      detailedOverview?: string;
      elevatorPitch?: string;
      marketingPositioning?: string;
    }
  ) {
    await this.verifyBusinessAccess(businessId, userId);

    const profile = await prisma.businessProfile.findUnique({
      where: { businessId }
    });

    if (!profile) {
      throw new AppError("Business profile not found", ErrorCode.RESOURCE_NOT_FOUND, 404);
    }

    const summary = await prisma.businessSummary.upsert({
      where: { businessProfileId: profile.id },
      update: {
        ...data,
        isApproved: true, // Manual overrides count as approved automatically
        approvedBy: userId,
        approvedAt: new Date()
      },
      create: {
        businessProfileId: profile.id,
        shortSummary: data.shortSummary || "",
        detailedOverview: data.detailedOverview || "",
        elevatorPitch: data.elevatorPitch || "",
        marketingPositioning: data.marketingPositioning || "",
        isApproved: true,
        generatedBy: userId,
        approvedBy: userId,
        approvedAt: new Date()
      }
    });

    return summary;
  }

  /**
   * Get active approved summary (fallback to auto-generated DNA if no approved summary exists)
   */
  static async getApprovedSummary(businessId: string) {
    const profile = await prisma.businessProfile.findUnique({
      where: { businessId },
      include: { summaries: true }
    });

    if (!profile || !profile.summaries || !profile.summaries.isApproved) {
      return null;
    }

    return profile.summaries;
  }

  /**
   * Search knowledge chunks using VectorService (RAG for brand context)
   */
  static async searchKnowledgeChunks(
    businessId: string,
    query: string,
    limit = 5,
    minSimilarity = 0.75
  ): Promise<KnowledgeChunkResult[]> {

    // Generate embedding for the query first
    let queryEmbedding: number[];
    if (VectorService.isMock) {
      queryEmbedding = Array.from({ length: 1536 }, () => Math.random());
    } else {
      queryEmbedding = await VectorService.embeddings.embedQuery(query);
    }

    const vectorSql = pgvector.toSql(queryEmbedding);

    // <=> is the Cosine Distance operator in pgvector (lower = better)
    const results = await prisma.$queryRaw`
      SELECT id, content, (embedding <=> ${vectorSql}::vector) as distance
      FROM "KnowledgeChunk"
      WHERE "knowledgeBaseId" = ${businessId}
        AND (embedding <=> ${vectorSql}::vector) <= ${1 - minSimilarity}
      ORDER BY embedding <=> ${vectorSql}::vector
      LIMIT ${limit}
    `;

    return results as KnowledgeChunkResult[];
  }

  /**
   * Delete chunks before reprocessing a document
   */
  static async cleanupDocumentChunks(documentId: string) {
    return await VectorService.deleteDocumentChunks(documentId);
  }

  /**
   * Perform Vector Similarity Search (legacy - use searchKnowledgeChunks)
   */
  static async searchSimilarChunks(knowledgeBaseId: string, queryEmbedding: number[], limit = 5) {
    const vectorSql = pgvector.toSql(queryEmbedding);

    // <=> is the Cosine Distance operator in pgvector (lower = better)
    return await prisma.$queryRaw`
      SELECT id, content, (embedding <=> ${vectorSql}::vector) as distance
      FROM "KnowledgeChunk"
      WHERE "knowledgeBaseId" = ${knowledgeBaseId}
      ORDER BY embedding <=> ${vectorSql}::vector
      LIMIT ${limit}
    `;
  }

  /**
   * Store a document reference (Step 1 of Ingestion)
   */
  static async registerDocument(
    businessId: string,
    input: { name: string; type: string; key: string; url: string; content?: string }
  ) {
    // 1. Ensure KnowledgeBase exists
    let kb = await prisma.knowledgeBase.findUnique({ where: { businessId } });
    if (!kb) {
      kb = await prisma.knowledgeBase.create({ data: { businessId } });
    }

    // 2. Cleanup any existing chunks for this document (idempotency)
    const existingDoc = await prisma.knowledgeDocument.findFirst({
      where: { filename: input.name, knowledgeBaseId: kb.id }
    });

    let documentId: string;
    if (existingDoc) {
      await this.cleanupDocumentChunks(existingDoc.id);
      const updated = await prisma.knowledgeDocument.update({
        where: { id: existingDoc.id },
        data: { status: "PROCESSING", s3Key: input.key }
      });
      documentId = updated.id;
    } else {
      const document = await prisma.knowledgeDocument.create({
        data: {
          knowledgeBaseId: kb.id,
          filename: input.name,
          fileType: input.type,
          s3Key: input.key,
          sourceUrl: input.url,
          status: "PROCESSING",
        },
      });
      documentId = document.id;
    }

    // 4. Async Processing via Queue
    await SchedulerService.queueKnowledgeTask({
      businessId,
      documentId,
      content: input.content || `Knowledge source: ${input.name}. Reference URL: ${input.url}`
    });

    await SystemLogger.logActivity({
      action: "KNOWLEDGE_DOCUMENT_REGISTERED",
      entity: "KnowledgeDocument",
      entityId: documentId,
      details: { businessId, name: input.name, type: input.type }
    });

    return { success: true, message: "Document ingestion queued for background processing", documentId };
  }

  /**
   * Get comprehensive brand context (Profile + Vector Search + AI Summaries)
   */
  static async getBrandContext(businessId: string, userId: string): Promise<string> {
    const profile = await this.getProfile(businessId, userId);
    if (!profile) {
      throw new AppError('Business profile not found', ErrorCode.RESOURCE_NOT_FOUND, 404);
    }

    // Prioritize AI Brand Summary if approved
    const approvedSummary = await this.getApprovedSummary(businessId);
    let brandDNA = "";
    
    if (approvedSummary) {
      brandDNA = `
- Elevator Pitch: ${approvedSummary.elevatorPitch}
- Short Summary: ${approvedSummary.shortSummary}
- Detailed Brand DNA: ${approvedSummary.detailedOverview}
- Marketing Positioning: ${approvedSummary.marketingPositioning}
      `.trim();
    } else {
      brandDNA = profile.uvp || "No approved summaries yet. Generating standard DNA from profile attributes.";
    }

    // Fetch matching chunks
    const relevantDocs = await this.searchKnowledgeChunks(
      businessId,
      `${profile.tone || "standard"} ${profile.industry || "brand"} identity and perspective`,
      3,
      0.60
    );

    const knowledgeContext = relevantDocs.map((doc) => `- ${doc.content.trim()}`).join('\n');

    return `
BRAND NAME: ${businessId}
CORE BRAND DNA SUMMARY:
${brandDNA}

ADDITIONAL METADATA:
- TAGLINE: ${profile.tagline || "Not specified"}
- SLOGAN: ${profile.slogan || "Not specified"}
- MISSION: ${profile.mission || "Not specified"}
- VISION: ${profile.vision || "Not specified"}
- UVP: ${profile.uniqueValueProposition || "Not specified"}
- MODEL: ${profile.businessModel || "Not specified"}
- CORE VALUES: ${profile.coreValues?.join(", ") || "Not specified"}
- MARKETS: ${profile.geographicMarkets?.join(", ") || "Not specified"}
- PRODUCTS/SERVICES: ${JSON.stringify(profile.productsServices) || "Not specified"}
- KEY BENEFITS: ${profile.keyBenefits?.join(", ") || "Not specified"}
- TONE: ${profile.tone || "Professional and engaging"}
- FORBIDDEN WORDS: ${profile.forbiddenWords?.join(", ") || "None"}

SUPPLEMENTAL CONTEXT FROM KNOWLEDGE DOCUMENTS:
${knowledgeContext || "No additional document context available."}
    `.trim();
  }
}