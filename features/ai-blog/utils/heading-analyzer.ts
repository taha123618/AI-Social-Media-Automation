/**
 * Heading Structure Analyzer
 * Validates heading hierarchy and provides SEO scoring
 */

export interface HeadingNode {
  level: number; // 1-6
  text: string;
  position: number;
}

export interface HeadingAnalysis {
  headings: HeadingNode[];
  hasH1: boolean;
  h1Count: number;
  hasProperHierarchy: boolean;
  hierarchyIssues: string[];
  score: number; // 0-100
  distribution: Record<string, number>;
}

/**
 * Extract headings from HTML content
 */
export function extractHeadings(html: string): HeadingNode[] {
  const headings: HeadingNode[] = [];
  const regex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  let match;
  let position = 0;

  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      text: match[2].replace(/<[^>]+>/g, "").trim(),
      position: position++,
    });
  }

  return headings;
}

/**
 * Validate heading hierarchy
 * Rules:
 * - Should have exactly one H1
 * - H2 should follow H1
 * - H3 should follow H2 (no skipping levels)
 * - Headings should be ordered properly
 */
export function validateHeadingHierarchy(headings: HeadingNode[]): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (headings.length === 0) {
    issues.push("No headings found. Add H2 headings to structure your content.");
    return { isValid: false, issues };
  }

  // Check H1 count
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    issues.push("No H1 heading found. Your article title should be wrapped in an H1 tag.");
  } else if (h1Count > 1) {
    issues.push(`Found ${h1Count} H1 headings. Use only one H1 per page.`);
  }

  // Check for level skipping
  for (let i = 1; i < headings.length; i++) {
    const current = headings[i].level;
    const previous = headings[i - 1].level;

    if (current > previous + 1) {
      issues.push(
        `Heading level skipped: H${previous} → H${current} at "${headings[i].text}". ` +
        `Don't skip heading levels (e.g., H2 → H4).`
      );
    }
  }

  // Check minimum H2 count for good structure
  const h2Count = headings.filter((h) => h.level === 2).length;
  if (h2Count < 2) {
    issues.push("Add more H2 headings to break up your content into scannable sections.");
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Analyze heading structure and return score
 */
export function analyzeHeadings(html: string): HeadingAnalysis {
  const headings = extractHeadings(html);
  const h1Count = headings.filter((h) => h.level === 1).length;
  const validation = validateHeadingHierarchy(headings);

  // Calculate distribution
  const distribution: Record<string, number> = {};
  for (let i = 1; i <= 6; i++) {
    const count = headings.filter((h) => h.level === i).length;
    if (count > 0) distribution[`h${i}`] = count;
  }

  // Calculate score
  let score = 100;

  // H1 scoring
  if (h1Count === 0) score -= 20;
  else if (h1Count > 1) score -= 15;

  // Hierarchy issues
  score -= Math.min(40, validation.issues.length * 10);

  // H2 count (optimal: 3-8)
  const h2Count = headings.filter((h) => h.level === 2).length;
  if (h2Count < 2) score -= 15;
  else if (h2Count < 3) score -= 5;
  else if (h2Count > 10) score -= 10;

  // Bonus for using H3 subheadings
  const h3Count = headings.filter((h) => h.level === 3).length;
  if (h3Count > 0 && h2Count >= 3) score = Math.min(100, score + 5);

  return {
    headings,
    hasH1: h1Count > 0,
    h1Count,
    hasProperHierarchy: validation.isValid,
    hierarchyIssues: validation.issues,
    score: Math.max(0, Math.min(100, score)),
    distribution,
  };
}
