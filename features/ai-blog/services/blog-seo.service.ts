/**
 * Blog SEO Analysis Service
 * Calculates page-level SEO score, analyzes heading hierarchy, keyword density,
 * readability metrics, and provides concrete improvement suggestions.
 */

import { analyzeReadability, readabilityToScore } from "../utils/readability";
import { analyzeKeywordDensity, analyzeKeywordPlacement, keywordDensityScore } from "../utils/keyword-analyzer";
import { analyzeHeadings } from "../utils/heading-analyzer";
import type { SEOReport, SEOIssue } from "../types/blog.types";

export class BlogSEOService {
  /**
   * Run full SEO analysis on a blog post
   */
  static analyze(
    title: string,
    content: string,
    metaDescription: string,
    targetKeywords: string[]
  ): SEOReport {
    const issues: SEOIssue[] = [];
    const suggestions: string[] = [];

    const primaryKeyword = targetKeywords[0] || "";

    // 1. Title Analysis
    let titleScore = 100;
    if (!title || title.trim().length === 0) {
      titleScore = 0;
      issues.push({
        type: "title",
        severity: "error",
        message: "Title is missing",
        suggestion: "Add a compelling title containing your primary keyword.",
      });
    } else {
      const titleLen = title.length;
      if (titleLen < 40) {
        titleScore -= 20;
        issues.push({
          type: "title",
          severity: "warning",
          message: "Title is too short",
          suggestion: "Aim for 50-60 characters to maximize organic CTR and keywords.",
        });
      } else if (titleLen > 70) {
        titleScore -= 15;
        issues.push({
          type: "title",
          severity: "warning",
          message: "Title is too long",
          suggestion: "Keep title under 60-70 characters so it doesn't get truncated in search results.",
        });
      }

      if (primaryKeyword && !title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
        titleScore -= 30;
        issues.push({
          type: "title",
          severity: "error",
          message: "Primary keyword not in title",
          suggestion: `Incorporate your primary keyword "${primaryKeyword}" into the title, preferably near the beginning.`,
        });
      }
    }

    // 2. Meta Description Analysis
    let metaDescriptionScore = 100;
    if (!metaDescription || metaDescription.trim().length === 0) {
      metaDescriptionScore = 0;
      issues.push({
        type: "meta",
        severity: "error",
        message: "Meta description is missing",
        suggestion: "Add a meta description to summarize the post and encourage search clicks.",
      });
    } else {
      const metaLen = metaDescription.length;
      if (metaLen < 120) {
        metaDescriptionScore -= 20;
        issues.push({
          type: "meta",
          severity: "warning",
          message: "Meta description is too short",
          suggestion: "Use 150-160 characters to summarize your value proposition fully.",
        });
      } else if (metaLen > 165) {
        metaDescriptionScore -= 15;
        issues.push({
          type: "meta",
          severity: "warning",
          message: "Meta description is too long",
          suggestion: "Truncate to under 160 characters so Google doesn't cut it off.",
        });
      }

      if (primaryKeyword && !metaDescription.toLowerCase().includes(primaryKeyword.toLowerCase())) {
        metaDescriptionScore -= 25;
        issues.push({
          type: "meta",
          severity: "error",
          message: "Primary keyword not in meta description",
          suggestion: `Include "${primaryKeyword}" in your meta description naturally.`,
        });
      }
    }

    // 3. Headings Analysis
    const headingAnalysis = analyzeHeadings(content);
    const headingStructureScore = headingAnalysis.score;
    headingAnalysis.hierarchyIssues.forEach((issueStr) => {
      issues.push({
        type: "headings",
        severity: "warning",
        message: "Heading hierarchy issue",
        suggestion: issueStr,
      });
    });

    // 4. Keyword Density & Placement Analysis
    const densityMap = analyzeKeywordDensity(content, targetKeywords);
    const primaryDensity = densityMap[primaryKeyword]?.density || 0;
    const kwDensityScoreVal = keywordDensityScore(content, primaryKeyword);

    if (primaryKeyword) {
      if (primaryDensity === 0) {
        issues.push({
          type: "keywords",
          severity: "error",
          message: "Primary keyword not found in content",
          suggestion: `Add your primary keyword "${primaryKeyword}" throughout the article content.`,
        });
      } else if (primaryDensity < 0.5) {
        issues.push({
          type: "keywords",
          severity: "warning",
          message: "Keyword density is low",
          suggestion: `Increase usage of "${primaryKeyword}". Current density is ${primaryDensity}%, optimal is 1-2%.`,
        });
      } else if (primaryDensity > 2.5) {
        issues.push({
          type: "keywords",
          severity: "warning",
          message: "Keyword density is too high",
          suggestion: `Reduce usage of "${primaryKeyword}" to avoid keyword stuffing penalties. Current density is ${primaryDensity}%.`,
        });
      }
    }

    const placement = analyzeKeywordPlacement(content, title, metaDescription, targetKeywords);
    if (!placement.inFirstParagraph) {
      issues.push({
        type: "keywords",
        severity: "warning",
        message: "Keyword missing in introduction",
        suggestion: "Use your primary keyword in the first 100 words of your article.",
      });
    }

    // 5. Readability Analysis
    const readabilityMetrics = analyzeReadability(content);
    const readabilityScore = readabilityToScore(readabilityMetrics.fleschKincaid);

    if (readabilityMetrics.fleschKincaid < 50) {
      issues.push({
        type: "readability",
        severity: "warning",
        message: "Readability is difficult",
        suggestion: "Shorten your sentences and use simpler vocabulary to make your content more accessible.",
      });
    } else if (readabilityMetrics.fleschKincaid > 80) {
      issues.push({
        type: "readability",
        severity: "info",
        message: "Readability is very simple",
        suggestion: "Your content is extremely easy to read. This is generally great, but ensure it matches your target audience.",
      });
    }

    // 6. Content Length Analysis
    let contentLengthScore = 100;
    const wordCount = readabilityMetrics.wordCount;
    if (wordCount < 500) {
      contentLengthScore = 40;
      issues.push({
        type: "content",
        severity: "error",
        message: "Thin content",
        suggestion: "Aim for at least 1,000+ words for competitive topics. Expand thin sections.",
      });
    } else if (wordCount < 1000) {
      contentLengthScore = 75;
      issues.push({
        type: "content",
        severity: "warning",
        message: "Content length is short",
        suggestion: "Consider expanding with more examples, data, or FAQs to hit 1,500+ words.",
      });
    }

    // 7. Internal Links Check (HTML anchor tags)
    let internalLinkScore = 100;
    const linksMatches = content.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
    if (linksMatches.length === 0) {
      internalLinkScore = 30;
      issues.push({
        type: "links",
        severity: "warning",
        message: "No outbound links",
        suggestion: "Add relevant links to high-quality internal pages or external resources to build domain trust.",
      });
    }

    // 8. Image Optimization Check
    let imageOptScore = 100;
    const imgMatches = content.match(/<img\s+[^>]*>/gi) || [];
    const missingAlt = content.match(/<img\s+(?![^>]*alt=["'])([^>]+)>/gi) || [];
    if (imgMatches.length > 0 && missingAlt.length > 0) {
      imageOptScore = 50;
      issues.push({
        type: "images",
        severity: "warning",
        message: "Images missing alt text attributes",
        suggestion: "Always add descriptive alt text containing key terms to all images.",
      });
    }

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      titleScore * 0.20 +
      metaDescriptionScore * 0.15 +
      headingStructureScore * 0.15 +
      kwDensityScoreVal * 0.15 +
      readabilityScore * 0.10 +
      contentLengthScore * 0.10 +
      internalLinkScore * 0.08 +
      imageOptScore * 0.07
    );

    // Create simple suggestions list from issues
    issues.forEach((issue) => {
      suggestions.push(issue.suggestion);
    });

    const serpPreview = {
      title: title || "SERP Title Preview",
      url: `https://yourdomain.com/blog/${(title || "article-slug").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      description: metaDescription || "Add meta description to preview how your page will look on Google search engine results.",
    };

    const densities: Record<string, number> = {};
    Object.entries(densityMap).forEach(([k, v]) => {
      densities[k] = v.density;
    });

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      titleScore,
      metaDescriptionScore,
      headingStructureScore,
      keywordDensityScore: kwDensityScoreVal,
      readabilityScore,
      contentLengthScore,
      internalLinkScore,
      imageOptScore,
      issues,
      suggestions,
      serpPreview,
      keywordDensity: densities,
      readabilityMetrics: {
        fleschKincaid: readabilityMetrics.fleschKincaid,
        gunningFog: readabilityMetrics.gunningFog,
        avgSentenceLength: readabilityMetrics.avgSentenceLength,
        avgWordLength: readabilityMetrics.avgWordLength,
      },
    };
  }
}
