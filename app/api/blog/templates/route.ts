import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import { BlogContentService } from "@/features/ai-blog/services/blog-content.service";
import { SystemLogger } from "@/features/system/services/logger.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: "No active workspace found" }, { status: 404 });
    }

    const templates = await BlogContentService.getTemplates(businessId);
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error("[API/BLOG/TEMPLATES] Failed to fetch templates:", error);
    await SystemLogger.logError({
      message: `Failed to fetch blog templates: ${error}`,
      source: "app/api/blog/templates/route.ts",
      context: "GET /api/blog/templates",
    });
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

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
    const { name, description, structure, systemPrompt } = body;

    if (!name || !structure) {
      return NextResponse.json({ success: false, error: "Name and structure are required" }, { status: 400 });
    }

    const template = await BlogContentService.createTemplate(businessId, name, structure, systemPrompt, description);
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    console.error("[API/BLOG/TEMPLATES] Failed to create template:", error);
    await SystemLogger.logError({
      message: `Failed to create blog template: ${error}`,
      source: "app/api/blog/templates/route.ts",
      context: "POST /api/blog/templates",
    });
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
