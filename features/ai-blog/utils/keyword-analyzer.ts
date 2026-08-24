/**
 * Keyword Analysis Utilities
 * Calculates keyword density, prominence, and placement scoring
 */

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Normalize a keyword for comparison
 */
function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().trim();
}

/**
 * Count occurrences of a keyword (or phrase) in text
 */
export function countKeywordOccurrences(text: string, keyword: string): number {
  const normalizedText = stripHtml(text).toLowerCase();
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) return 0;

  let count = 0;
  let idx = 0;
  while ((idx = normalizedText.indexOf(normalizedKeyword, idx)) !== -1) {
    count++;
    idx += normalizedKeyword.length;
  }
  return count;
}

/**
 * Calculate keyword density as a percentage
 */
export function calculateKeywordDensity(text: string, keyword: string): number {
  const plainText = stripHtml(text);
  const words = plainText.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return 0;

  const occurrences = countKeywordOccurrences(text, keyword);
  const keywordWordCount = normalizeKeyword(keyword).split(/\s+/).length;

  return Math.round((occurrences * keywordWordCount / words.length) * 1000) / 10;
}

/**
 * Analyze keyword density for multiple keywords
 */
export function analyzeKeywordDensity(
  text: string,
  keywords: string[]
): Record<string, { count: number; density: number; status: "optimal" | "low" | "high" }> {
  const result: Record<string, { count: number; density: number; status: "optimal" | "low" | "high" }> = {};

  for (const keyword of keywords) {
    const count = countKeywordOccurrences(text, keyword);
    const density = calculateKeywordDensity(text, keyword);

    let status: "optimal" | "low" | "high";
    if (density >= 0.5 && density <= 2.5) {
      status = "optimal";
    } else if (density < 0.5) {
      status = "low";
    } else {
      status = "high";
    }

    result[keyword] = { count, density, status };
  }

  return result;
}

/**
 * Check keyword placement in key positions
 */
export function analyzeKeywordPlacement(
  content: string,
  title: string | null,
  metaDescription: string | null,
  keywords: string[]
): {
  inTitle: boolean;
  inMetaDescription: boolean;
  inFirstParagraph: boolean;
  inHeadings: boolean;
  inConclusion: boolean;
  placementScore: number;
} {
  const normalizedKeywords = keywords.map(normalizeKeyword);

  // Check title
  const normalizedTitle = (title || "").toLowerCase();
  const inTitle = normalizedKeywords.some((k) => normalizedTitle.includes(k));

  // Check meta description
  const normalizedMeta = (metaDescription || "").toLowerCase();
  const inMetaDescription = normalizedKeywords.some((k) => normalizedMeta.includes(k));

  // Check first paragraph
  const plainText = stripHtml(content);
  const paragraphs = plainText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const firstParagraph = (paragraphs[0] || "").toLowerCase();
  const inFirstParagraph = normalizedKeywords.some((k) => firstParagraph.includes(k));

  // Check headings (h1-h6)
  const headingMatches = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
  const headingText = headingMatches.join(" ").toLowerCase();
  const inHeadings = normalizedKeywords.some((k) => headingText.includes(k));

  // Check conclusion (last paragraph)
  const lastParagraph = (paragraphs[paragraphs.length - 1] || "").toLowerCase();
  const inConclusion = normalizedKeywords.some((k) => lastParagraph.includes(k));

  // Calculate placement score (0-100)
  let placementScore = 0;
  if (inTitle) placementScore += 30;
  if (inMetaDescription) placementScore += 20;
  if (inFirstParagraph) placementScore += 25;
  if (inHeadings) placementScore += 15;
  if (inConclusion) placementScore += 10;

  return {
    inTitle,
    inMetaDescription,
    inFirstParagraph,
    inHeadings,
    inConclusion,
    placementScore,
  };
}

/**
 * Calculate keyword density score (0-100) for primary keyword
 */
export function keywordDensityScore(text: string, primaryKeyword: string): number {
  const density = calculateKeywordDensity(text, primaryKeyword);

  // Ideal density: 1.0-2.0%
  if (density >= 1.0 && density <= 2.0) return 100;
  if (density >= 0.5 && density < 1.0) return 80;
  if (density > 2.0 && density <= 2.5) return 80;
  if (density > 2.5 && density <= 3.0) return 60;
  if (density > 0 && density < 0.5) return 50;
  if (density > 3.0) return 30; // Keyword stuffing
  return 0; // No keyword at all
}
