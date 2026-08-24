/**
 * Blog Humanizer Service
 * Rewrites AI text to bypass AI detectors and sound more natural/human-written
 */

import { AIService } from "@/services/ai/ai.service";
import { BlogPromptService } from "./blog-prompt.service";

export class BlogHumanizerService {
  /**
   * Humanizes article content with specified intensity
   */
  static async humanize(content: string, intensity: "light" | "medium" | "heavy" = "medium"): Promise<string> {
    const userPrompt = BlogPromptService.getHumanizePrompt(content, intensity);
    const systemPrompt = "You are a professional human editor and developmental editor specializing in natural flow, styling, and tone correction.";

    try {
      const response = await AIService.generateCompletion({
        model: AIService.getEnvironmentInfo().defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        maxTokens: 4000,
      });

      return response.content;
    } catch (error) {
      console.error("[BLOG-HUMANIZER] Error humanizing content:", error);
      throw error;
    }
  }
}
