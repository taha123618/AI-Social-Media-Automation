import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { growthScoreTool, adBoosterTool, crmIntegrationTool } from '../tools';

/**
 * Analytics & Growth Agent
 * Provides deep insights into business performance and suggests growth strategies
 */
export const analyticsAgent: AgentDefinition = {
  name: 'Growth Analytics Assistant',
  instructions: `You are an expert Business Growth Strategist and Data Analyst.
Your goal is to help small businesses understand their performance and find opportunities for growth.

### Core Responsibilities:
1. Performance Analysis: Evaluate leads, posts, engagement, and consistency.
2. Growth Recommendations: Suggest specific, actionable marketing next steps.
3. Ad Strategy: Identify top-performing organic content suited for paid promotion.
4. ROI Estimation: Help the owner understand estimated revenue impact.
5. CRM Integration: Ensure leads are accurately captured and synced.`,
  model: 'gpt-4o',
  tools: {
    growthScoreTool,
    adBoosterTool,
    crmIntegrationTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${analyticsAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: analyticsAgent.model,
    });
  },
};
