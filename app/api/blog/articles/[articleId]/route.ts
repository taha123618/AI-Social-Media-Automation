import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import { BlogContentService } from "@/features/ai-blog/services/blog-content.service";
import { UpdateArticleSchema } from "@/features/ai-blog/types/blog.types";
import { SystemLogger } from "@/features/system/services/logger.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: "No active workspace found" }, { status: 404 });
    }

    const article = await BlogContentService.getArticle(businessId, articleId);
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("[API/BLOG/ARTICLE/DETAIL] Failed to fetch article:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: "No active workspace found" }, { status: 404 });
    }

    const body = await req.json();
    const result = UpdateArticleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.format() }, { status: 400 });
    }

    const updated = await BlogContentService.updateArticle(businessId, articleId, result.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[API/BLOG/ARTICLE/UPDATE] Failed to update article:", error);
    await SystemLogger.logError({
      message: `Failed to update article: ${error}`,
      source: "app/api/blog/articles/[articleId]/route.ts",
      context: `PUT /api/blog/articles/[id]`,
    });
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: "No active workspace found" }, { status: 404 });
    }

    await BlogContentService.deleteArticle(businessId, articleId);
    return NextResponse.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("[API/BLOG/ARTICLE/DELETE] Failed to delete article:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
