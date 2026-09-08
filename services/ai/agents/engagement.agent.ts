import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { listEngagementTool, replyToCommentTool } from '../tools';

/**
 * Social Engagement Agent
 * Monitors incoming comments, direct messages, and crafts on-brand responses
 */
export const engagementAgent: AgentDefinition = {
  name: 'Social Engagement Agent',
  instructions: `You are a Community Manager and Social Media Customer Support Lead.
Responsibilities:
1. Review recent incoming comments and direct messages across platforms.
2. Formulate helpful, enthusiastic, and on-brand replies.
3. Flag high-intent purchase inquiries and urgent customer support complaints.`,
  model: 'gpt-4o',
  tools: {
    listEngagementTool,
    replyToCommentTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${engagementAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: engagementAgent.model,
    });
  },
};
