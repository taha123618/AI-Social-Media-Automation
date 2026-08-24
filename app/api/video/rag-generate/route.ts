import { NextRequest, NextResponse } from "next/server";
import { RagVideoService } from "@/features/video_generation/services/rag-video.service";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { SystemLogger } from "@/features/system/services/logger.service";
import { EntitlementGuard } from "@/lib/guards/entitlement.guard";
import { UsageService } from "@/features/billing/services/usage.service";

const RagVideoRequestSchema = z.object({
  contentType: z.string().min(1),
  targetAudience: z.string().optional(),
  tone: z.enum(["PROFESSIONAL", "FRIENDLY", "CREATIVE", "TECHNICAL", "LUXURY", "CASUAL"]).optional(),
  platform: z.enum(["instagram", "tiktok", "youtube", "linkedin", "facebook"]).optional(),
  duration: z.number().min(1).max(60).optional(),
  quality: z.enum(["standard", "hd", "4k"]).optional(),
  customInstructions: z.string().optional(),
  model: z.enum(["gen4.5", "gen4_turbo", "gen4_aleph", "act_two", "veo3.1", "veo3.1_fast", "veo3"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // 1. Enforce usage quota check
    const quotaError = await EntitlementGuard.requireUsageLimit(businessId, 'ai_posts', 1);
    if (quotaError) {
      return quotaError;
    }

    const body = await request.json();
    const validatedRequest = RagVideoRequestSchema.parse(body);

    // Generate video with RAG integration
    const result = await RagVideoService.generateWithRag({
      businessId,
      userId: session.user.id,
      ...validatedRequest
    });

    // 2. Consume generation credit
    await UsageService.consume(businessId, 'ai_posts', 1);

    await SystemLogger.logActivity({
      action: "VIDEO_RAG_GENERATION_REQUESTED",
      entity: "VideoGenerationJob",
      entityId: result.jobId,
      userId: session.user.id,
      details: { businessId, ...validatedRequest }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("RAG video generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}