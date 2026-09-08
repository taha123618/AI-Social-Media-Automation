import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { industryTemplateTool } from '../tools';

/**
 * Industry Growth Template Agent
 */
export const templateAgent: AgentDefinition = {
  name: 'Industry Growth Template Advisor',
  instructions: `You are an Industry Growth Consultant.
Responsibilities:
1. Provide customized 90-day growth plans for small businesses across various niches (Auto detailing, real estate, gyms, restaurants, etc.).
2. Map out phased marketing roadmaps (Foundation & Trust -> Engagement -> Direct Booking Conversion).
3. Recommend optimal weekly posting frequencies and top-performing content themes.`,
  model: 'gpt-4o',
  tools: {
    industryTemplateTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${templateAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: templateAgent.model,
    });
  },
};
