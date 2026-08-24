import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import { BlogGeneratorService } from "@/features/ai-blog/services/blog-generator.service";
import { GenerateOutlineSchema } from "@/features/ai-blog/types/blog.types";
import { SystemLogger } from "@/features/system/services/logger.service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: "No active workspace found" }, { status: 404 });
    }

    const body = await req.json();
    const result = GenerateOutlineSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.format() }, { status: 400 });
    }

    const outline = await BlogGeneratorService.generateOutline({
      topic: result.data.topic,
      targetKeywords: result.data.targetKeywords,
      secondaryKeywords: result.data.secondaryKeywords,
      tone: result.data.tone,
      language: "en",
      wordCountTarget: result.data.wordCountTarget,
    });

    return NextResponse.json({ success: true, data: outline });
  } catch (error) {
    console.error("[API/BLOG/GENERATE/OUTLINE] Outline generation failed:", error);
    await SystemLogger.logError({
      message: `Outline generation failed: ${error}`,
      source: "app/api/blog/generate/outline/route.ts",
      context: "POST /api/blog/generate/outline",
    });
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
