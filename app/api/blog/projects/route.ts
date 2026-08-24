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

    const projects = await BlogContentService.getProjects(businessId);
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("[API/BLOG/PROJECTS] Failed to fetch projects:", error);
    await SystemLogger.logError({
      message: `Failed to fetch blog projects: ${error}`,
      source: "app/api/blog/projects/route.ts",
      context: "GET /api/blog/projects",
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    }

    const project = await BlogContentService.createProject(businessId, session.user.id, name, description);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("[API/BLOG/PROJECTS] Failed to create project:", error);
    await SystemLogger.logError({
      message: `Failed to create blog project: ${error}`,
      source: "app/api/blog/projects/route.ts",
      context: "POST /api/blog/projects",
    });
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
