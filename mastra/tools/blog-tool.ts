import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const blogContentTool = createTool({
  id: 'blog-content-tool',
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
      'SEO_OPTIMIZE'
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
    const { action, topic, keywords, tone, language, existingContent, outline, targetLength, articleId, businessId } = inputData;

    // This tool primarily serves as a structured interface for the agent to express its intent
    // The actual LLM call will be handled by the Agent using this tool's input or by the workflow

    // For logging purposes if businessId is provided
    if (businessId && articleId) {
      await prisma.blogGenerationLog.create({
        data: {
          articleId,
          businessId,
          action: action as any,
          inputPrompt: JSON.stringify({ topic, keywords, tone, action }),
          model: 'gpt-4o', // Default placeholder
          status: 'COMPLETED',
        }
      });
    }

    return {
      success: true,
      action,
      message: `Ready to ${action} for topic: ${topic || 'existing content'}`,
      input: { topic, keywords, tone, language, targetLength }
    };
  },
});

export const seoAnalyzerTool = createTool({
  id: 'seo-analyzer-tool',
  description: 'Analyzes blog content for SEO best practices, keyword density, and readability.',
  inputSchema: z.object({
    content: z.string(),
    title: z.string(),
    metaDescription: z.string(),
    targetKeywords: z.array(z.string()),
  }),
  execute: async (inputData) => {
    const { content, title, metaDescription, targetKeywords } = inputData;

    // Basic heuristic-based SEO analysis
    const wordCount = content.split(/\s+/).length;
    const keywordDensity = targetKeywords.map(kw => {
      const regex = new RegExp(kw, 'gi');
      const count = (content.match(regex) || []).length;
      return {
        keyword: kw,
        count,
        density: (count / wordCount) * 100
      };
    });

    const issues = [];
    if (wordCount < 1000) issues.push('Content length is below recommended 1000 words for deep SEO.');
    if (title.length < 30 || title.length > 60) issues.push('Title length should be between 30-60 characters.');
    if (metaDescription.length < 120 || metaDescription.length > 160) issues.push('Meta description should be between 120-160 characters.');

    const score = Math.max(0, 100 - (issues.length * 10));

    return {
      score,
      wordCount,
      keywordDensity,
      issues,
      suggestions: issues.map(issue => `Fix: ${issue}`),
    };
  },
});
