import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import { BlogContentService } from "@/features/ai-blog/services/blog-content.service";

export async function POST(
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

    const { versionId } = await req.json();
    if (!versionId) {
      return NextResponse.json({ success: false, error: "versionId is required" }, { status: 400 });
    }

    const result = await BlogContentService.restoreVersion(businessId, articleId, versionId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[API/BLOG/VERSIONS] Failed to restore version:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const versions = await BlogContentService.getArticleVersions(businessId, articleId);
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error("[API/BLOG/VERSIONS] Failed to fetch article versions:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
