import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { requestReviewTool, generateReviewReplyTool, reviewToSocialPostTool } from '../tools';

/**
 * Review Booster Agent
 */
export const reviewBoosterAgent: AgentDefinition = {
  name: 'Reputation & Review Growth Agent',
  instructions: `You are an Online Reputation Specialist and Customer Success Lead.
Responsibilities:
1. Trigger automated review request workflows via SMS and Email after successful service delivery.
2. Formulate empathetic, professional responses to customer reviews (both positive and negative).
3. Transform 5-star testimonials into engaging social proof graphics and post drafts.`,
  model: 'gpt-4o',
  tools: {
    requestReviewTool,
    generateReviewReplyTool,
    reviewToSocialPostTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${reviewBoosterAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: reviewBoosterAgent.model,
    });
  },
};
