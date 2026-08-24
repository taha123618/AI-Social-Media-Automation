import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import prisma from "@/lib/prisma";
import { BlogGeneratorService } from "@/features/ai-blog/services/blog-generator.service";
import { BlogSEOService } from "@/features/ai-blog/services/blog-seo.service";
import { SystemLogger } from "@/features/system/services/logger.service";

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

    // Find the article
    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, outline, customPrompt } = body;

    // Action 1: Generate Outline
    if (action === "GENERATE_OUTLINE") {
      await prisma.blogArticle.update({
        where: { id: articleId },
        data: { status: "GENERATING" },
      });

      try {
        const generatedOutline = await BlogGeneratorService.generateOutline({
          topic: customPrompt || article.title || "Blog Post Topic",
          targetKeywords: article.targetKeywords,
          secondaryKeywords: article.secondaryKeywords,
          tone: article.tone as any,
          language: article.language,
          wordCountTarget: 1500,
        });

        const updated = await prisma.blogArticle.update({
          where: { id: articleId },
          data: {
            outline: generatedOutline as any,
            title: generatedOutline.title,
            metaDescription: generatedOutline.metaDescription,
            status: "DRAFT",
          },
        });

        // Log generation event
        await prisma.blogGenerationLog.create({
          data: {
            articleId,
            businessId,
            action: "GENERATE_OUTLINE",
            inputPrompt: customPrompt || article.title || "Blog Post Topic",
            outputPreview: JSON.stringify(generatedOutline).substring(0, 500),
            model: "gemini-2.0-flash-lite",
            status: "COMPLETED",
          },
        });

        return NextResponse.json({ success: true, data: updated });
      } catch (genError: any) {
        await prisma.blogArticle.update({
          where: { id: articleId },
          data: { status: "DRAFT" },
        });
        throw genError;
      }
    }

    // Action 2: Generate Full Article
    if (action === "GENERATE_ARTICLE") {
      const activeOutline = outline || article.outline;

      if (!activeOutline) {
        return NextResponse.json({ success: false, error: "An outline is required to generate the article" }, { status: 400 });
      }

      await prisma.blogArticle.update({
        where: { id: articleId },
        data: { status: "GENERATING" },
      });

      try {
        const htmlContent = await BlogGeneratorService.generateArticle(activeOutline, {
          topic: article.title || "Blog Post Topic",
          targetKeywords: article.targetKeywords,
          secondaryKeywords: article.secondaryKeywords,
          tone: article.tone as any,
          language: article.language,
          wordCountTarget: (activeOutline as any).estimatedWordCount || 1500,
        });

        // Run SEO analysis
        const seoReport = BlogSEOService.analyze(
          article.title || "",
          htmlContent,
          article.metaDescription || "",
          article.targetKeywords
        );

        const wordCount = htmlContent.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 250));

        const updated = await prisma.blogArticle.update({
          where: { id: articleId },
          data: {
            content: htmlContent,
            wordCount,
            readingTime,
            seoScore: seoReport.overallScore,
            status: "REVIEW",
          },
        });

        // Save SEO report
        await prisma.blogSEOReport.create({
          data: {
            articleId,
            overallScore: seoReport.overallScore,
            titleScore: seoReport.titleScore,
            metaDescriptionScore: seoReport.metaDescriptionScore,
            headingStructureScore: seoReport.headingStructureScore,
            keywordDensityScore: seoReport.keywordDensityScore,
            readabilityScore: seoReport.readabilityScore,
            contentLengthScore: seoReport.contentLengthScore,
            internalLinkScore: seoReport.internalLinkScore,
            imageOptScore: seoReport.imageOptScore,
            issues: seoReport.issues as any,
            suggestions: seoReport.suggestions as any,
            serpPreview: seoReport.serpPreview as any,
          },
        });

        // Log generation event
        await prisma.blogGenerationLog.create({
          data: {
            articleId,
            businessId,
            action: "GENERATE_ARTICLE",
            inputPrompt: JSON.stringify(activeOutline),
            outputPreview: htmlContent.substring(0, 500),
            model: "gemini-2.0-flash-lite",
            status: "COMPLETED",
          },
        });

        return NextResponse.json({ success: true, data: updated });
      } catch (genError: any) {
        await prisma.blogArticle.update({
          where: { id: articleId },
          data: { status: "DRAFT" },
        });
        throw genError;
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[API/BLOG/GENERATE] Full generation run failed:", error);
    await SystemLogger.logError({
      message: `Full article generation failed: ${error}`,
      source: "app/api/blog/articles/[articleId]/generate/route.ts",
      context: "POST /api/blog/articles/[id]/generate",
    });
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
