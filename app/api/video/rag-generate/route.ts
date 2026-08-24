import { NextRequest, NextResponse } from "next/server";
import { RagVideoService } from "@/features/video_generation/services/rag-video.service";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { SystemLogger } from "@/features/system/services/logger.service";

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

    const body = await request.json();
    const validatedRequest = RagVideoRequestSchema.parse(body);

    // Generate video with RAG integration
    const result = await RagVideoService.generateWithRag({
      businessId,
      userId: session.user.id,
      ...validatedRequest
    });

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

    // Handle specific Runway credit error
    if (error instanceof Error && error.message.includes("You do not have enough credits")) {
      return NextResponse.json(
        {
          error: "Insufficient credits: Your Runway account doesn't have enough credits to generate this video. Please add credits to your Runway account and try again.",
          type: "CREDIT_ERROR",
          docUrl: "https://docs.dev.runwayml.com/api",
          creditsInfo: {
            currentCredits: 0,
            requiredCredits: 10
          }
        },
        { status: 402 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate brand-aware video" },
      { status: 500 }
    );
  }
}