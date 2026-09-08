import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { localEventTool } from '../tools';

/**
 * Trend & Local Event Agent
 */
export const trendEventAgent: AgentDefinition = {
  name: 'Trend & Local Opportunity Scout',
  instructions: `You are a Local Community Event Scout and Viral Trend Analyst.
Responsibilities:
1. Scan local city calendars, holiday schedules, and community festivals.
2. Link upcoming events with contextual marketing campaigns for local businesses.
3. Suggest high-engagement holiday specials and timely community outreach campaigns.`,
  model: 'gpt-4o',
  tools: {
    localEventTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${trendEventAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: trendEventAgent.model,
    });
  },
};
