/**
 * Blog Stream Service
 * Handles streaming AI content generation with real-time output
 */

import { AIService } from "@/services/ai/ai.service";
import { BlogPromptService } from "./blog-prompt.service";
import type { BlogGenerationConfig, BlogOutline } from "../types/blog.types";

interface StreamEvent {
  type: "token" | "complete" | "error" | "meta";
  data: any;
}

export class BlogStreamService {
  /**
   * Stream article generation with real-time token output
   */
  static async *streamArticle(
    outline: BlogOutline,
    config: BlogGenerationConfig,
  ): AsyncGenerator<StreamEvent> {
    const systemPrompt = BlogPromptService.getSystemPrompt(config);
    const userPrompt = BlogPromptService.getArticleGenerationPrompt(outline, config);

    const startTime = Date.now();

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

      const duration = Date.now() - startTime;
      const wordCount = response.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

      yield { type: "token", data: response.content };
      yield {
        type: "complete",
        data: {
          content: response.content,
          wordCount,
          readingTime: Math.max(1, Math.ceil(wordCount / 250)),
          duration,
          usage: response.usage,
        },
      };
    } catch (error: any) {
      yield { type: "error", data: { message: error.message } };
    }
  }

  /**
   * Stream SEO analysis results
   */
  static async *streamSEOAnalysis(
    title: string,
    content: string,
    metaDescription: string,
    targetKeywords: string[],
  ): AsyncGenerator<StreamEvent> {
    const { BlogSEOService } = await import("./blog-seo.service");

    const report = BlogSEOService.analyze(title, content, metaDescription, targetKeywords);

    // Yield scores one by one
    const scores = [
      { key: "title", label: "Title Score", value: report.titleScore },
      { key: "meta", label: "Meta Description", value: report.metaDescriptionScore },
      { key: "headings", label: "Heading Structure", value: report.headingStructureScore },
      { key: "keywords", label: "Keyword Density", value: report.keywordDensityScore },
      { key: "readability", label: "Readability", value: report.readabilityScore },
      { key: "content", label: "Content Length", value: report.contentLengthScore },
    ];

    for (const score of scores) {
      yield { type: "meta", data: score };
      await new Promise((r) => setTimeout(r, 100));
    }

    yield {
      type: "complete",
      data: {
        overallScore: report.overallScore,
        issues: report.issues,
        suggestions: report.suggestions,
        serpPreview: report.serpPreview,
        readabilityMetrics: report.readabilityMetrics,
        keywordDensity: report.keywordDensity,
      },
    };
  }

  /**
   * Generate and stream article titles
   */
  static async *streamTitles(
    topic: string,
    keywords: string[],
    count = 5,
    style?: string,
  ): AsyncGenerator<StreamEvent> {
    try {
      const titles = await BlogPromptService.getTitleGenerationPrompt(topic, keywords, count, style);
      const response = await AIService.generateJSON<string[]>({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: "You are a professional copywriter specializing in high-CTR headlines." },
          { role: "user", content: titles },
        ],
        temperature: 0.8,
      });

      for (const title of response) {
        yield { type: "token", data: title };
        await new Promise((r) => setTimeout(r, 50));
      }

      yield { type: "complete", data: { titles: response } };
    } catch (error: any) {
      yield { type: "error", data: { message: error.message } };
    }
  }
}
