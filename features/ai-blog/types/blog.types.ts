import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────────────────────────────

export const CreateArticleSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  topic: z.string().min(1).max(500),
  targetKeywords: z.array(z.string().max(100)).min(1).max(20),
  secondaryKeywords: z.array(z.string().max(100)).max(30).optional(),
  tone: z.enum([
    "PROFESSIONAL", "CONVERSATIONAL", "ACADEMIC", "CASUAL",
    "PERSUASIVE", "STORYTELLING", "HUMOROUS", "AUTHORITATIVE",
    "INSPIRATIONAL", "TECHNICAL",
  ]).default("PROFESSIONAL"),
  language: z.string().default("en"),
  wordCountTarget: z.number().min(300).max(10000).default(1500),
  projectId: z.string().optional(),
  templateId: z.string().optional(),
});

export const GenerateOutlineSchema = z.object({
  topic: z.string().min(1).max(500),
  targetKeywords: z.array(z.string()).min(1).max(20),
  secondaryKeywords: z.array(z.string()).max(30).optional(),
  tone: z.string().default("PROFESSIONAL"),
  wordCountTarget: z.number().min(300).max(10000).default(1500),
  numSections: z.number().min(3).max(15).default(6),
});

export const GenerateTitleSchema = z.object({
  topic: z.string().min(1).max(500),
  targetKeywords: z.array(z.string()).min(1).max(10),
  count: z.number().min(1).max(10).default(5),
  style: z.enum(["listicle", "howto", "question", "guide", "comparison", "news"]).optional(),
});

export const GenerateMetaSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(10),
  targetKeywords: z.array(z.string()).min(1),
});

export const GenerateFAQSchema = z.object({
  topic: z.string().min(1),
  content: z.string().min(10),
  targetKeywords: z.array(z.string()).min(1),
  count: z.number().min(3).max(10).default(5),
});

export const GenerateCTASchema = z.object({
  topic: z.string().min(1),
  content: z.string().min(10),
  businessContext: z.string().optional(),
  count: z.number().min(1).max(5).default(3),
});

export const ExpandSectionSchema = z.object({
  section: z.string().min(1),
  context: z.string().optional(),
  targetKeywords: z.array(z.string()).optional(),
  tone: z.string().default("PROFESSIONAL"),
});

export const RewriteSectionSchema = z.object({
  section: z.string().min(1),
  instruction: z.string().optional(),
  tone: z.string().default("PROFESSIONAL"),
});

export const HumanizeSchema = z.object({
  content: z.string().min(10),
  intensity: z.enum(["light", "medium", "heavy"]).default("medium"),
});

export const UpdateArticleSchema = z.object({
  title: z.string().max(300).optional(),
  content: z.string().optional(),
  contentMarkdown: z.string().optional(),
  contentJson: z.any().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  excerpt: z.string().max(500).optional(),
  featuredImageUrl: z.string().url().optional(),
  status: z.enum(["DRAFT", "GENERATING", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  targetKeywords: z.array(z.string()).optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  tone: z.string().optional(),
  outline: z.any().optional(),
  faqItems: z.any().optional(),
  ctaContent: z.any().optional(),
});

export const ExportArticleSchema = z.object({
  format: z.enum(["markdown", "html", "json"]),
});

export const StreamGenerateSchema = z.object({
  articleId: z.string(),
  action: z.enum([
    "GENERATE_ARTICLE", "EXPAND_SECTION", "REWRITE_SECTION",
    "HUMANIZE", "GENERATE_TITLE", "GENERATE_META",
    "GENERATE_FAQ", "GENERATE_CTA",
  ]),
  input: z.record(z.string(), z.any()).optional(),
});

// ─────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface BlogOutlineSection {
  heading: string;
  level: number; // 2 or 3
  keyPoints: string[];
  targetWordCount: number;
  suggestedKeywords: string[];
}

export interface BlogOutline {
  title: string;
  metaDescription: string;
  sections: BlogOutlineSection[];
  estimatedWordCount: number;
  estimatedReadingTime: number;
}

export interface SEOIssue {
  type: "title" | "meta" | "headings" | "keywords" | "readability" | "content" | "links" | "images";
  severity: "error" | "warning" | "info";
  message: string;
  suggestion: string;
}

export interface SEOReport {
  overallScore: number;
  titleScore: number;
  metaDescriptionScore: number;
  headingStructureScore: number;
  keywordDensityScore: number;
  readabilityScore: number;
  contentLengthScore: number;
  internalLinkScore: number;
  imageOptScore: number;
  issues: SEOIssue[];
  suggestions: string[];
  serpPreview: {
    title: string;
    url: string;
    description: string;
  };
  keywordDensity: Record<string, number>;
  readabilityMetrics: {
    fleschKincaid: number;
    gunningFog: number;
    avgSentenceLength: number;
    avgWordLength: number;
  };
}

export interface BlogGenerationConfig {
  topic: string;
  targetKeywords: string[];
  secondaryKeywords?: string[];
  tone: string;
  language: string;
  wordCountTarget: number;
  outline?: BlogOutline;
  businessContext?: string;
  templatePrompt?: string;
}

export interface BlogFAQItem {
  question: string;
  answer: string;
}

export interface BlogCTA {
  headline: string;
  description: string;
  buttonText: string;
  placement: "inline" | "end" | "sidebar";
}

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type GenerateOutlineInput = z.infer<typeof GenerateOutlineSchema>;
export type GenerateTitleInput = z.infer<typeof GenerateTitleSchema>;
export type GenerateMetaInput = z.infer<typeof GenerateMetaSchema>;
export type GenerateFAQInput = z.infer<typeof GenerateFAQSchema>;
export type GenerateCTAInput = z.infer<typeof GenerateCTASchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
export type ExportArticleInput = z.infer<typeof ExportArticleSchema>;
