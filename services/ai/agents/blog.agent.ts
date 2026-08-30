import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { blogContentTool, seoAnalyzerTool } from '../tools';

/**
 * Blog Writer Agent
 * Generates high-quality, long-form blog content, outlines, and multi-tone articles.
 */
export const blogWriterAgent: AgentDefinition = {
  name: 'Blog Writer Agent',
  instructions: `You are an expert Senior Content Strategist and Ghostwriter specialized in SEO-driven long-form content.
Generate blog articles that are:
1. Highly engaging and natural (bypasses generic AI patterns).
2. Strategically structured for readability (H1, H2, H3, bullet points).
3. Optimized for search engines while maintaining a premium brand voice.
4. Action-oriented with clear CTAs, meta descriptions, and FAQs.`,
  model: 'gpt-4o',
  tools: {
    blogContentTool,
    seoAnalyzerTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${blogWriterAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: blogWriterAgent.model,
    });
  },
};

/**
 * SEO Specialist Agent
 * Focuses on semantic keyword optimization, featured snippets, and internal linking.
 */
export const blogSeoAgent: AgentDefinition = {
  name: 'SEO Specialist Agent',
  instructions: `You are a World-Class SEO Architect.
Responsibilities:
1. Semantic Optimization: Naturally weave LSI keywords.
2. Featured Snippet Engineering: Craft definitions and structured lists.
3. NLP-Friendly Formatting: Ensure proper heading hierarchy and search intent fulfillment.
4. Meta Excellence: Craft high-CTR Meta Titles and Descriptions.`,
  model: 'gpt-4o',
  tools: {
    seoAnalyzerTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${blogSeoAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: blogSeoAgent.model,
    });
  },
};
