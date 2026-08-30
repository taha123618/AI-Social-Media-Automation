import { z } from 'zod';
import { ToolDefinition } from '../types';
import prisma from '@/lib/prisma';

export const blogContentTool: ToolDefinition<
  {
    action: 'GENERATE_OUTLINE' | 'GENERATE_ARTICLE' | 'GENERATE_TITLE' | 'GENERATE_META' | 'GENERATE_FAQ' | 'GENERATE_CTA' | 'EXPAND_SECTION' | 'REWRITE_SECTION' | 'HUMANIZE' | 'SUMMARIZE' | 'SEO_OPTIMIZE';
    topic?: string;
    keywords?: string[];
    tone?: string;
    language?: string;
    existingContent?: string;
    outline?: any;
    targetLength?: number;
    articleId?: string;
    businessId?: string;
  },
  {
    success: boolean;
    action: string;
    message: string;
    input: Record<string, any>;
  }
> = {
  id: 'blog-content-tool',
  name: 'Blog Content Tool',
  description: 'Generates and optimizes blog content components like titles, outlines, sections, and SEO meta tags.',
  inputSchema: z.object({
    action: z.enum([
      'GENERATE_OUTLINE',
      'GENERATE_ARTICLE',
      'GENERATE_TITLE',
      'GENERATE_META',
      'GENERATE_FAQ',
      'GENERATE_CTA',
      'EXPAND_SECTION',
      'REWRITE_SECTION',
      'HUMANIZE',
      'SUMMARIZE',
      'SEO_OPTIMIZE',
    ]),
    topic: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tone: z.string().optional().default('PROFESSIONAL'),
    language: z.string().optional().default('en'),
    existingContent: z.string().optional(),
    outline: z.any().optional(),
    targetLength: z.number().optional(),
    articleId: z.string().optional(),
    businessId: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { action, topic, keywords, tone, language, targetLength, articleId, businessId } = inputData;

    if (businessId && articleId) {
      await prisma.blogGenerationLog.create({
        data: {
          articleId,
          businessId,
          action: action as any,
          inputPrompt: JSON.stringify({ topic, keywords, tone, action }),
          model: 'gpt-4o',
          status: 'COMPLETED',
        },
      });
    }

    return {
      success: true,
      action,
      message: `Ready to ${action} for topic: ${topic || 'existing content'}`,
      input: { topic, keywords, tone, language, targetLength },
    };
  },
};

export const seoAnalyzerTool: ToolDefinition<
  {
    content: string;
    title: string;
    metaDescription: string;
    targetKeywords: string[];
  },
  {
    score: number;
    wordCount: number;
    keywordDensity: Array<{ keyword: string; count: number; density: number }>;
    issues: string[];
    suggestions: string[];
  }
> = {
  id: 'seo-analyzer-tool',
  name: 'SEO Content Analyzer',
  description: 'Analyzes blog content for SEO best practices, keyword density, and readability.',
  inputSchema: z.object({
    content: z.string(),
    title: z.string(),
    metaDescription: z.string(),
    targetKeywords: z.array(z.string()),
  }),
  execute: async (inputData) => {
    const { content, title, metaDescription, targetKeywords } = inputData;

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const keywordDensity = targetKeywords.map((kw) => {
      const regex = new RegExp(kw, 'gi');
      const count = (content.match(regex) || []).length;
      return {
        keyword: kw,
        count,
        density: wordCount > 0 ? (count / wordCount) * 100 : 0,
      };
    });

    const issues: string[] = [];
    if (wordCount < 1000) issues.push('Content length is below recommended 1000 words for deep SEO.');
    if (title.length < 30 || title.length > 60) issues.push('Title length should be between 30-60 characters.');
    if (metaDescription.length < 120 || metaDescription.length > 160) issues.push('Meta description should be between 120-160 characters.');

    const score = Math.max(0, 100 - issues.length * 10);

    return {
      score,
      wordCount,
      keywordDensity,
      issues,
      suggestions: issues.map((issue) => `Fix: ${issue}`),
    };
  },
};
