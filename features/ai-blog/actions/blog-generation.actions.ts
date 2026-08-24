"use server";

import { BlogStreamService } from "../services/blog-stream.service";
import { BlogSEOService } from "../services/blog-seo.service";
import { BlogAnalyticsService } from "../services/blog-analytics.service";
import prisma from "@/lib/prisma";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import type { BlogGenerationConfig, BlogOutline } from "../types/blog.types";

export async function streamGenerateArticle(
  articleId: string,
  outline: BlogOutline,
  config: BlogGenerationConfig,
) {
  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return { success: false, error: "No active workspace" };

  const article = await prisma.blogArticle.findFirst({
    where: { id: articleId, businessId },
  });
  if (!article) throw new Error("Article not found");

  await prisma.blogArticle.update({
    where: { id: articleId },
    data: { status: "GENERATING" },
  });

  const content: string[] = [];
  let result: any = null;

  try {
    const generator = BlogStreamService.streamArticle(outline, config);
    for await (const event of generator) {
      if (event.type === "token") {
        content.push(event.data);
      }
      if (event.type === "complete") {
        result = event.data;
      }
      if (event.type === "error") {
        throw new Error(event.data.message);
      }
    }

    const fullContent = content.join("");
    if (!fullContent && !result?.content) {
      throw new Error("No content was generated");
    }

    const htmlContent = result?.content || fullContent;
    const wordCount = htmlContent.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 250));

    const seoReport = BlogSEOService.analyze(
      article.title || "",
      htmlContent,
      article.metaDescription || "",
      article.targetKeywords,
    );

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

    await prisma.blogGenerationLog.create({
      data: {
        articleId,
        businessId,
        action: "GENERATE_ARTICLE",
        inputPrompt: JSON.stringify(outline),
        outputPreview: htmlContent.substring(0, 500),
        model: "stream-ai",
        status: "COMPLETED",
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    await prisma.blogArticle.update({
      where: { id: articleId },
      data: { status: "DRAFT" },
    });
    return { success: false, error: error.message };
  }
}

export async function analyzeSEO(
  articleId: string,
  title: string,
  content: string,
  metaDescription: string,
  targetKeywords: string[],
) {
  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return { success: false, error: "No active workspace" };

  try {
    const report = BlogSEOService.analyze(title, content, metaDescription, targetKeywords);

    await prisma.blogSEOReport.create({
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

    await prisma.blogArticle.update({
      where: { id: articleId },
      data: { seoScore: report.overallScore },
    });

    return { success: true, data: report };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBlogDashboardAnalytics(days = 30) {
  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return null;

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [dashboard, seoMetrics, keywordData, trends] = await Promise.all([
    BlogAnalyticsService.getDashboardAnalytics({ businessId, startDate }),
    BlogAnalyticsService.getSEOMetrics(businessId, days),
    BlogAnalyticsService.getKeywordAnalytics(businessId),
    BlogAnalyticsService.getGenerationTrends(businessId, days),
  ]);

  return { dashboard, seoMetrics, keywordData, trends };
}
