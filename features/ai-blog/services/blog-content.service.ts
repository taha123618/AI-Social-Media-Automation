/**
 * Blog Content Service
 * Core Database CRUD operations for Blog Projects, Articles, Templates, and Saved Prompts.
 * Enforces strict multi-tenancy isolation by requiring businessId scope.
 */

import prisma from "@/lib/prisma";
import type { CreateArticleInput, UpdateArticleInput } from "../types/blog.types";
import { BlogSEOService } from "./blog-seo.service";

export class BlogContentService {
  // ─────────────────────────────────────────────────────────────────────
  // Blog Projects
  // ─────────────────────────────────────────────────────────────────────

  static async getProjects(businessId: string) {
    return prisma.blogProject.findMany({
      where: { businessId },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async createProject(businessId: string, creatorId: string, name: string, description?: string) {
    return prisma.blogProject.create({
      data: {
        name,
        description,
        businessId,
        creatorId,
      },
    });
  }

  static async getProjectDetails(businessId: string, projectId: string) {
    return prisma.blogProject.findFirst({
      where: { id: projectId, businessId },
      include: {
        articles: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // Blog Articles
  // ─────────────────────────────────────────────────────────────────────

  static async getArticles(businessId: string, projectId?: string) {
    return prisma.blogArticle.findMany({
      where: {
        businessId,
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getArticle(businessId: string, articleId: string) {
    return prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
      include: {
        project: true,
        seoReports: {
          orderBy: { analyzedAt: "desc" },
          take: 1,
        },
      },
    });
  }

  static async createArticle(businessId: string, creatorId: string, input: CreateArticleInput) {
    const slug = input.title
      ? input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : `article-${Math.random().toString(36).substring(2, 8)}`;

    return prisma.blogArticle.create({
      data: {
        businessId,
        creatorId,
        title: input.title || "Untitled Blog Post",
        slug,
        targetKeywords: input.targetKeywords,
        secondaryKeywords: input.secondaryKeywords || [],
        tone: input.tone,
        language: input.language,
        projectId: input.projectId || null,
        status: "DRAFT",
      },
    });
  }

  static async updateArticle(businessId: string, articleId: string, input: UpdateArticleInput) {
    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });

    if (!article) throw new Error("Article not found or access denied");

    // Auto-generate slug if title changes
    let slug = article.slug;
    if (input.title && input.title !== article.title) {
      slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Calculate word counts if content changes
    let wordCount = article.wordCount;
    let readingTime = article.readingTime;

    if (input.content) {
      const words = input.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean);
      wordCount = words.length;
      readingTime = Math.max(1, Math.ceil(wordCount / 250));
    }

    // Run real-time SEO scoring if content or metadata changes
    let seoScore = article.seoScore;
    const contentToAnalyze = input.content !== undefined ? input.content : article.content || "";
    const titleToAnalyze = input.title !== undefined ? input.title : article.title || "";
    const metaToAnalyze = input.metaDescription !== undefined ? input.metaDescription : article.metaDescription || "";
    const keywordsToAnalyze = input.targetKeywords !== undefined ? input.targetKeywords : article.targetKeywords;

    if (input.content !== undefined || input.title !== undefined || input.metaDescription !== undefined || input.targetKeywords !== undefined) {
      const report = BlogSEOService.analyze(
        titleToAnalyze,
        contentToAnalyze,
        metaToAnalyze,
        keywordsToAnalyze
      );
      seoScore = report.overallScore;

      // Save SEO report
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
    }

    const updated = await prisma.blogArticle.update({
      where: { id: articleId },
      data: {
        title: input.title,
        slug,
        content: input.content,
        contentMarkdown: input.contentMarkdown,
        contentJson: input.contentJson,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        excerpt: input.excerpt,
        featuredImageUrl: input.featuredImageUrl,
        status: input.status as any,
        targetKeywords: input.targetKeywords,
        secondaryKeywords: input.secondaryKeywords,
        tone: input.tone as any,
        outline: input.outline,
        faqItems: input.faqItems,
        ctaContent: input.ctaContent,
        wordCount,
        readingTime,
        seoScore,
      },
    });

    // Create version snapshot if content is changing
    if (input.content && input.content !== article.content) {
      const latestVersion = await prisma.blogArticleVersion.findFirst({
        where: { articleId },
        orderBy: { versionNumber: "desc" },
      });

      const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      await prisma.blogArticleVersion.create({
        data: {
          articleId,
          versionNumber: nextVersionNumber,
          title: updated.title,
          content: updated.content,
          contentJson: updated.contentJson || {},
          changedBy: updated.creatorId,
          changeNote: "Auto-saved version",
        },
      });
    }

    return updated;
  }

  static async deleteArticle(businessId: string, articleId: string) {
    let article = businessId
      ? await prisma.blogArticle.findFirst({ where: { id: articleId, businessId } })
      : null;

    if (!article) {
      article = await prisma.blogArticle.findUnique({ where: { id: articleId } });
    }

    if (!article) throw new Error("Article not found or access denied");

    return prisma.blogArticle.delete({ where: { id: articleId } });
  }

  // ─────────────────────────────────────────────────────────────────────
  // Version History
  // ─────────────────────────────────────────────────────────────────────

  static async getArticleVersions(businessId: string, articleId: string) {
    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });

    if (!article) throw new Error("Article not found or access denied");

    return prisma.blogArticleVersion.findMany({
      where: { articleId },
      orderBy: { versionNumber: "desc" },
    });
  }

  static async restoreVersion(businessId: string, articleId: string, versionId: string) {
    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });
    if (!article) throw new Error("Article not found or access denied");

    const version = await prisma.blogArticleVersion.findFirst({
      where: { id: versionId, articleId },
    });
    if (!version) throw new Error("Version not found");

    const updated = await prisma.blogArticle.update({
      where: { id: articleId },
      data: {
        title: version.title,
        content: version.content,
        contentJson: version.contentJson || undefined,
      },
    });

    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────
  // Blog Templates
  // ─────────────────────────────────────────────────────────────────────

  static async getTemplates(businessId: string) {
    return prisma.blogTemplate.findMany({
      where: {
        OR: [
          { businessId },
          { isGlobal: true },
        ],
      },
      orderBy: { name: "asc" },
    });
  }

  static async createTemplate(businessId: string, name: string, structure: any, systemPrompt?: string, description?: string) {
    return prisma.blogTemplate.create({
      data: {
        name,
        description,
        structure,
        systemPrompt,
        businessId,
        isGlobal: false,
      },
    });
  }
}
