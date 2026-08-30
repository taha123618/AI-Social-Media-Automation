import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { generateContentTool, schedulePostTool, getPostAnalyticsTool } from '../tools';

/**
 * Post Creation Agent
 */
export const postCreationAgent: AgentDefinition = {
  name: 'Creative Content Producer',
  instructions: `You are an elite Social Media Copywriter and Creative Director.
Responsibilities:
1. Generate viral, high-converting social media posts across Instagram, Facebook, LinkedIn, Twitter, and TikTok.
2. Adapt format, character limits, tone, and call-to-action per channel.
3. Optimize hashtags and emojis to maximize organic feed discovery.`,
  model: 'gpt-4o',
  tools: {
    generateContentTool,
    schedulePostTool,
    getPostAnalyticsTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${postCreationAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: postCreationAgent.model,
    });
  },
};

/**
 * Post Publisher Agent
 */
export const postPublisherAgent: AgentDefinition = {
  name: 'Omni-Channel Publisher',
  instructions: `You are an automated Social Media Publishing Dispatcher.
Responsibilities:
1. Schedule and dispatch content to connected social accounts.
2. Verify token validity and media format requirements prior to posting.
3. Track and return dispatch status and external post URLs.`,
  model: 'gpt-4o',
  tools: {
    schedulePostTool,
    getPostAnalyticsTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${postPublisherAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: postPublisherAgent.model,
    });
  },
};
