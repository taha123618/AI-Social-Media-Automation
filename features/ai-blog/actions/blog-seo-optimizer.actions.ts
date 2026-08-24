"use server";

import { BlogSEOOptimizer } from "../services/blog-seo-optimizer.service";
import { BlogSEOService } from "../services/blog-seo.service";
import { BlogContentService } from "../services/blog-content.service";
import prisma from "@/lib/prisma";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function applySEOFixes(
  articleId: string,
  title: string,
  content: string,
  metaDescription: string,
  targetKeywords: string[],
) {
  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return { success: false, error: "No active workspace" };

  try {
    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });

    if (!article) return { success: false, error: "Article not found" };

    const report = BlogSEOService.analyze(title, content, metaDescription, targetKeywords);

    const optimized = BlogSEOOptimizer.optimize(
      title,
      content,
      metaDescription,
      targetKeywords,
      report,
    );

    const userId = await getUserId();

    await BlogContentService.updateArticle(businessId, articleId, {
      title: optimized.title,
      metaDescription: optimized.metaDescription,
      content: optimized.content,
      targetKeywords,
      status: article.status as any,
    });

    const updatedReport = BlogSEOService.analyze(
      optimized.title,
      optimized.content,
      optimized.metaDescription,
      targetKeywords,
    );

    return {
      success: true,
      data: {
        title: optimized.title,
        metaDescription: optimized.metaDescription,
        content: optimized.content,
        changes: optimized.changes,
        report: updatedReport,
      },
    };
  } catch (error: any) {
    console.error("[SEO OPTIMIZER] Failed:", error);
    return { success: false, error: error.message };
  }
}
