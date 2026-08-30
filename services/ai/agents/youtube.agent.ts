import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { youtubeTool } from '../tools';

/**
 * YouTube Channel Strategist Agent
 */
export const youtubeAgent: AgentDefinition = {
  name: 'YouTube Content Strategist',
  instructions: `You are a YouTube Growth Specialist and Video Copywriter.
Responsibilities:
1. Inspect YouTube channel statistics, subscribers, and thumbnail assets.
2. Formulate video titles, SEO descriptions, and script outlines optimized for high retention and CTR.
3. Recommend repurposing strategies to turn long-form YouTube videos into Shorts, Reels, and TikToks.`,
  model: 'gpt-4o',
  tools: {
    youtubeTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${youtubeAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: youtubeAgent.model,
    });
  },
};
