import type { SEOReport } from "../types/blog.types";

interface OptimizeResult {
  title: string;
  metaDescription: string;
  content: string;
  changes: SEOChange[];
}

export interface SEOChange {
  type: string;
  description: string;
  diff?: { before: string; after: string };
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might",
  "this","that","these","those","it","its","they","them","their","we",
  "our","you","your","he","she","his","her","him","who","which","what",
  "why","how","when","where","not","no","nor","all","each","every",
  "some","any","both","few","more","most","other","into","over","about",
  "than","then","also","just","very","too","much","many","such","only",
  "own","same","so",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function extractSentences(html: string): string[] {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text
    .split(/[.!?]+\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

export class BlogSEOOptimizer {
  static optimize(
    title: string,
    content: string,
    metaDescription: string,
    targetKeywords: string[],
    report: SEOReport,
  ): OptimizeResult {
    const changes: SEOChange[] = [];
    let resultTitle = title;
    let resultMeta = metaDescription;
    let resultContent = content;
    const primaryKeyword = targetKeywords[0] || "";

    // ── 1. Optimize Title ──
    if (report.titleScore < 80) {
      const titleOptimized = this.optimizeTitle(resultTitle, primaryKeyword);
      if (titleOptimized !== resultTitle) {
        changes.push({
          type: "title",
          description: `Optimized title length and keyword placement`,
          diff: { before: resultTitle, after: titleOptimized },
        });
        resultTitle = titleOptimized;
      }
    }

    // ── 2. Optimize Meta Description ──
    if (report.metaDescriptionScore < 80) {
      const metaOptimized = this.optimizeMetaDescription(resultMeta, primaryKeyword);
      if (metaOptimized !== resultMeta) {
        changes.push({
          type: "meta",
          description: `Enhanced meta description with keyword and optimal length`,
          diff: { before: resultMeta, after: metaOptimized },
        });
        resultMeta = metaOptimized;
      }
    }

    // ── 3. Fix Image Alt Text ──
    if (report.imageOptScore < 80) {
      const imgResult = this.optimizeImageAltText(resultContent, targetKeywords);
      if (imgResult !== resultContent) {
        changes.push({
          type: "images",
          description: `Added descriptive alt text to ${this.countChanges(resultContent, imgResult, "<img")} image(s)`,
        });
        resultContent = imgResult;
      }
    }

    // ── 4. Optimize Heading Structure ──
    if (report.headingStructureScore < 80) {
      const headingResult = this.optimizeHeadings(resultContent, targetKeywords);
      if (headingResult !== resultContent) {
        changes.push({
          type: "headings",
          description: `Improved heading hierarchy and keyword inclusion`,
        });
        resultContent = headingResult;
      }
    }

    // ── 5. Enhance Keyword Density ──
    if (report.keywordDensityScore < 80 && primaryKeyword) {
      const kwResult = this.enhanceKeywordDensity(resultContent, primaryKeyword, targetKeywords);
      if (kwResult !== resultContent) {
        changes.push({
          type: "keywords",
          description: `Increased natural keyword density for "${primaryKeyword}"`,
        });
        resultContent = kwResult;
      }
    }

    // ── 6. Improve Readability ──
    if (report.readabilityScore < 70) {
      const readResult = this.improveReadability(resultContent);
      if (readResult !== resultContent) {
        changes.push({
          type: "readability",
          description: `Simplified complex sentences for better readability`,
        });
        resultContent = readResult;
      }
    }

    // ── 7. Add Internal/External Links ──
    if (report.internalLinkScore < 80) {
      const linkResult = this.addRelevantLinks(resultContent, targetKeywords);
      if (linkResult !== resultContent) {
        changes.push({
          type: "links",
          description: `Added contextual outbound links to improve domain authority`,
        });
        resultContent = linkResult;
      }
    }

    // ── 8. Expand Content Length ──
    if (report.contentLengthScore < 80) {
      const expandResult = this.expandContent(resultContent, targetKeywords);
      if (expandResult !== resultContent) {
        changes.push({
          type: "content",
          description: `Expanded content with additional context and examples`,
        });
        resultContent = expandResult;
      }
    }

    return {
      title: resultTitle,
      metaDescription: resultMeta,
      content: resultContent,
      changes,
    };
  }

  private static optimizeTitle(title: string, keyword: string): string {
    let optimized = title.trim();

    if (optimized.length < 40) {
      if (keyword && !optimized.toLowerCase().includes(keyword.toLowerCase())) {
        optimized = `${keyword}: ${optimized}`;
      }
      if (optimized.length < 40) {
        optimized = `${optimized} | Complete Guide`;
      }
    }

    if (optimized.length > 65) {
      optimized = optimized.slice(0, 62).replace(/\s+\S*$/, "") + "...";
    }

    if (keyword && !optimized.toLowerCase().includes(keyword.toLowerCase())) {
      const words = optimized.split(" ");
      if (words.length > 2) {
        words.splice(1, 0, keyword);
        optimized = words.join(" ");
      } else {
        optimized = `${keyword} - ${optimized}`;
      }
    }

    return optimized;
  }

  private static optimizeMetaDescription(meta: string, keyword: string): string {
    let optimized = meta.trim();

    if (!optimized) {
      optimized = keyword
        ? `Learn everything about ${keyword}. This comprehensive guide covers key strategies, best practices, and actionable insights.`
        : `Discover expert insights and practical strategies in this comprehensive guide. Learn proven techniques and best practices.`;
    }

    if (keyword && !optimized.toLowerCase().includes(keyword.toLowerCase())) {
      optimized = `${keyword} — ${optimized.charAt(0).toLowerCase() + optimized.slice(1)}`;
    }

    if (optimized.length < 130) {
      optimized = optimized + " Learn proven strategies, expert tips, and actionable techniques to achieve better results.";
    }
    if (optimized.length > 165) {
      optimized = optimized.slice(0, 162).replace(/\s+\S*$/, "") + ".";
    }

    return optimized;
  }

  private static optimizeImageAltText(html: string, keywords: string[]): string {
    return html.replace(
      /<img\s+([^>]*?)src="([^"]+)"([^>]*?)(?:alt="")?([^>]*?)\/?>/gi,
      (match, before, src, middle, after) => {
        if (/alt="[^"]+"/i.test(match)) return match;
        const keyword = keywords[0] || "article";
        const filename = src.split("/").pop()?.split(".")[0]?.replace(/[_-]/g, " ") || "";
        const descriptiveAlt = filename.length > 3
          ? `${filename} — ${keyword} related illustration`
          : `Illustration for ${keyword} — ${keyword} concept visualization`;
        return `<img ${before}src="${src}"${middle} alt="${descriptiveAlt}"${after}>`;
      },
    );
  }

  private static optimizeHeadings(html: string, keywords: string[]): string {
    const keyword = keywords[0] || "";
    if (!keyword) return html;

    return html.replace(/<h([2-4])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
      const cleanText = text.replace(/<[^>]+>/g, "").trim();
      if (!cleanText) return match;

      const lower = cleanText.toLowerCase();
      const kwLower = keyword.toLowerCase();

      if (!lower.includes(kwLower) && cleanText.length > 15 && Math.random() > 0.6) {
        const updated = cleanText.replace(
          /(\S+)$/,
          `${keyword} $1`,
        );
        return `<h${level}${attrs}>${updated}</h${level}>`;
      }

      if (cleanText.length < 10 && level === "2") {
        return `<h2${attrs}>${cleanText}: A Comprehensive Overview</h2>`;
      }

      return match;
    });
  }

  private static enhanceKeywordDensity(
    html: string,
    primaryKeyword: string,
    allKeywords: string[],
  ): string {
    const wordCount = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const currentDensity = this.countKeywordOccurrences(html, primaryKeyword) / wordCount * 100;

    if (currentDensity >= 1.0) return html;

    const paragraphs = html.match(/<p[^>]*>.*?<\/p>/gi) || [];
    if (paragraphs.length === 0) return html;

    const targetAdditions = Math.max(1, Math.floor(wordCount * 0.01 - this.countKeywordOccurrences(html, primaryKeyword)));

    let result = html;
    let added = 0;

    for (let i = 0; i < paragraphs.length && added < targetAdditions; i++) {
      const p = paragraphs[i];
      const pText = p.replace(/<[^>]+>/g, "").trim();
      const pLower = pText.toLowerCase();

      if (pLower.includes(primaryKeyword.toLowerCase())) continue;
      if (pText.length < 50) continue;

      const sentences = pText.match(/[^.!?]+[.!?]+/g) || [pText];

      for (let s = 0; s < sentences.length && added < targetAdditions; s++) {
        const sentence = sentences[s].trim();
        const sLower = sentence.toLowerCase();

        if (sLower.includes(primaryKeyword.toLowerCase())) continue;
        if (sentence.length < 20) continue;

        if (sentence.endsWith(".") || sentence.endsWith("!") || sentence.endsWith("?")) {
          const insertPoint = sentence.length - 1;
          const newSentence = sentence.slice(0, insertPoint) + `, especially when considering ${primaryKeyword}` + sentence.slice(insertPoint);

          result = result.replace(sentence, newSentence);
          added++;
        }
      }
    }

    return result;
  }

  private static improveReadability(html: string): string {
    let result = html;

    result = result.replace(/<p[^>]*>([^<]{150,}?)<\/p>/gi, (match, content) => {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
      if (sentences.length <= 1) return match;

      const longSentences = sentences.filter((s: string) => s.trim().split(/\s+/).length > 25);

      if (longSentences.length === 0) return match;

      let optimized = content;
      for (const longSent of longSentences) {
        const words = longSent.trim().split(/\s+/);
        if (words.length > 25) {
          const mid = Math.ceil(words.length / 2);
          const beforePeriod = words.slice(0, mid - 1).join(" ");
          const afterComma = words.slice(mid - 1).join(" ");
          const shortened = `${beforePeriod}. ${afterComma.charAt(0).toUpperCase() + afterComma.slice(1)}`;
          optimized = optimized.replace(longSent, shortened);
        }
      }

      return match.replace(content, optimized);
    });

    return result;
  }

  private static addRelevantLinks(html: string, keywords: string[]): string {
    const hasLinks = /<a\s+[^>]*href=/i.test(html);
    if (hasLinks) return html;
    if (!keywords[0]) return html;

    const keyword = keywords[0];

    return html.replace(
      new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, "gi"),
      (match, offset) => {
        if (offset > 0 && offset < 50) return match;
        if (Math.random() > 0.3) return match;
        return `<a href="https://www.google.com/search?q=${encodeURIComponent(keyword)}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      },
    );
  }

  private static expandContent(html: string, keywords: string[]): string {
    const wordCount = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    if (wordCount >= 1000) return html;

    const keyword = keywords[0] || "this topic";
    const expandParagraph = `
<p>To further enhance your understanding of ${keyword}, it's worth exploring how industry leaders are implementing these strategies. By staying updated with the latest trends and continuously refining your approach, you can achieve significantly better results and maintain a competitive edge in your field.</p>
`;

    const insertBefore = html.lastIndexOf("</article>") > -1
      ? html.lastIndexOf("</article>")
      : html.lastIndexOf("</h2>") > -1
        ? html.lastIndexOf("</h2>") + 5
        : html.length;

    return html.slice(0, insertBefore) + expandParagraph + html.slice(insertBefore);
  }

  private static countKeywordOccurrences(html: string, keyword: string): number {
    const text = html.replace(/<[^>]+>/g, " ");
    const regex = new RegExp(this.escapeRegex(keyword), "gi");
    return (text.match(regex) || []).length;
  }

  private static countChanges(before: string, after: string, tag: string): number {
    const beforeCount = (before.match(new RegExp(tag, "gi")) || []).length;
    const afterCount = (after.match(new RegExp(tag, "gi")) || []).length;
    return Math.abs(afterCount - beforeCount);
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
