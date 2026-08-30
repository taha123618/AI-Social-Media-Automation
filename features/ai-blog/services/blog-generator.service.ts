/**
 * Blog Generator Service
 * Orchestrates AI generation tasks for the Blog Writer using the core AIService
 */

import { AIService } from "@/services/ai/ai.service";
import { BlogPromptService } from "./blog-prompt.service";
import type { BlogGenerationConfig, BlogOutline, BlogFAQItem, BlogCTA } from "../types/blog.types";

export class BlogGeneratorService {
  /**
   * Generates a detailed blog article outline based on topic and keywords
   */
  static async generateOutline(config: BlogGenerationConfig): Promise<BlogOutline> {
    const systemPrompt = BlogPromptService.getSystemPrompt(config);
    const userPrompt = BlogPromptService.getOutlinePrompt(config);

    try {
      const response = await AIService.generateJSON<BlogOutline>({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      });

      return response;
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error generating outline:", error);
      throw error;
    }
  }

  /**
   * Generates the full blog article in HTML based on a structured outline
   */
  static async generateArticle(outline: BlogOutline, config: BlogGenerationConfig): Promise<string> {
    const systemPrompt = BlogPromptService.getSystemPrompt(config);
    const userPrompt = BlogPromptService.getArticleGenerationPrompt(outline, config);

    try {
      const response = await AIService.generateCompletion({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 4000,
      });

      return response.content;
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error generating article:", error);
      throw error;
    }
  }

  /**
   * Generates multiple click-worthy blog headlines/titles
   */
  static async generateTitles(topic: string, keywords: string[], count = 5, style?: string): Promise<string[]> {
    const systemPrompt = "You are a professional copywriter specializing in high-click-through-rate blog headlines.";
    const userPrompt = BlogPromptService.getTitleGenerationPrompt(topic, keywords, count, style);

    try {
      const response = await AIService.generateJSON<string[]>({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      });

      return response;
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error generating titles:", error);
      throw error;
    }
  }

  /**
   * Generates an SEO meta title and meta description for the article
   */
  static async generateMeta(title: string, content: string, keywords: string[]): Promise<{ metaTitle: string; metaDescription: string }> {
    const systemPrompt = "You are an SEO metadata specialist focused on organic CTR optimization.";
    const userPrompt = BlogPromptService.getMetaGenerationPrompt(title, content, keywords);

    try {
      return await AIService.generateJSON<{ metaTitle: string; metaDescription: string }>({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      });
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error generating meta:", error);
      throw error;
    }
  }

  /**
   * Generates FAQs for an article
   */
  static async generateFAQs(topic: string, content: string, keywords: string[], count = 5): Promise<BlogFAQItem[]> {
    const systemPrompt = "You are an SEO specialist optimizer targeting Google Featured Snippets and People Also Ask sections.";
    const userPrompt = BlogPromptService.getFAQGenerationPrompt(topic, content, keywords, count);

    try {
      return await AIService.generateJSON<BlogFAQItem[]>({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      });
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error generating FAQs:", error);
      throw error;
    }
  }

  /**
   * Generates business-targeted Calls to Action
   */
  static async generateCTAs(topic: string, content: string, businessContext: string | undefined, count = 3): Promise<BlogCTA[]> {
    const systemPrompt = "You are a conversion rate optimization (CRO) expert crafting high-converting calls to action.";
    const userPrompt = BlogPromptService.getCTAGenerationPrompt(topic, content, businessContext, count);

    try {
      return await AIService.generateJSON<BlogCTA[]>({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      });
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error generating CTAs:", error);
      throw error;
    }
  }

  /**
   * Expands an existing section using AI
   */
  static async expandSection(section: string, context: string | undefined, keywords: string[] | undefined, tone: string): Promise<string> {
    const config: BlogGenerationConfig = {
      topic: "Section Expansion",
      targetKeywords: keywords || [],
      tone,
      language: "en",
      wordCountTarget: 500,
    };

    const systemPrompt = BlogPromptService.getSystemPrompt(config);
    const userPrompt = BlogPromptService.getExpandSectionPrompt(section, context, keywords, tone);

    try {
      const response = await AIService.generateCompletion({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 1000,
      });
      return response.content;
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error expanding section:", error);
      throw error;
    }
  }

  /**
   * Rewrites an existing section based on prompt instructions
   */
  static async rewriteSection(section: string, instruction: string | undefined, tone: string): Promise<string> {
    const config: BlogGenerationConfig = {
      topic: "Section Rewrite",
      targetKeywords: [],
      tone,
      language: "en",
      wordCountTarget: 300,
    };

    const systemPrompt = BlogPromptService.getSystemPrompt(config);
    const userPrompt = BlogPromptService.getRewriteSectionPrompt(section, instruction, tone);

    try {
      const response = await AIService.generateCompletion({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 1000,
      });
      return response.content;
    } catch (error) {
      console.error("[BLOG-GENERATOR] Error rewriting section:", error);
      throw error;
    }
  }

  /**
   * Generates a complete blog post pipeline using the custom AI Blog Workflow DAG
   */
  static async generateWithWorkflow(params: {
    topic: string;
    businessId: string;
    keywords?: string[];
    tone?: string;
    targetAudience?: string;
  }) {
    try {
      const { blogWorkflow } = await import('@/services/ai/workflows/blog.workflow');
      return await blogWorkflow.execute({
        topic: params.topic,
        keywords: params.keywords || [],
        tone: params.tone || 'professional',
        targetAudience: params.targetAudience,
        businessId: params.businessId,
      });
    } catch (error) {
      console.error('[BLOG-GENERATOR] Error executing blog workflow:', error);
      throw error;
    }
  }
}

