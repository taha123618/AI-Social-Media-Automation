import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import prisma from "@/lib/prisma";
import { BlogSEOService } from "@/features/ai-blog/services/blog-seo.service";

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

    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const report = BlogSEOService.analyze(
      article.title || "",
      article.content || "",
      article.metaDescription || "",
      article.targetKeywords
    );

    // Save and cache the report in database
    const savedReport = await prisma.blogSEOReport.create({
      data: {
        articleId,
        overallScore: report.overallScore,
        titleScore: report.titleScore,
        metaDescriptionScore: report.metaDescriptionScore,
        headingStructureScore: report.headingStructureScore,
        keywordDensityScore: report.keywordDensityScore,
        readabilityScore: report.readabilityScore,
        contentLengthScore: report.contentLengthScore,
        internalLinkScore: report.internalLinkScore,
        imageOptScore: report.imageOptScore,
        issues: report.issues as any,
        suggestions: report.suggestions as any,
        serpPreview: report.serpPreview as any,
      },
    });

    // Update article cached score
    await prisma.blogArticle.update({
      where: { id: articleId },
      data: { seoScore: report.overallScore },
    });

    return NextResponse.json({ success: true, data: { report: savedReport, fullAnalysis: report } });
  } catch (error) {
    console.error("[API/BLOG/SEO] Failed to analyze article:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
