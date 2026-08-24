import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import { BlogContentService } from "@/features/ai-blog/services/blog-content.service";
import { CreateArticleSchema } from "@/features/ai-blog/types/blog.types";
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

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId") || undefined;

    const articles = await BlogContentService.getArticles(businessId, projectId);
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error("[API/BLOG/ARTICLES] Failed to list articles:", error);
    await SystemLogger.logError({
      message: `Failed to list articles: ${error}`,
      source: "app/api/blog/articles/route.ts",
      context: "GET /api/blog/articles",
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
    const result = CreateArticleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.format() }, { status: 400 });
    }

    const article = await BlogContentService.createArticle(businessId, session.user.id, result.data);
    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error("[API/BLOG/ARTICLES] Failed to create article:", error);
    await SystemLogger.logError({
      message: `Failed to create article: ${error}`,
      source: "app/api/blog/articles/route.ts",
      context: "POST /api/blog/articles",
    });
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
