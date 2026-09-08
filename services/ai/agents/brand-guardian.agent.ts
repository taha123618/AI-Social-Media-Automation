import { AgentDefinition } from '../types';
import { brandGuardianTool } from '../tools/brand-guardian.tool';
import { AIService } from '../ai.service';

export const brandGuardianAgent: AgentDefinition = {
  name: 'brandGuardianAgent',
  instructions: `You are an elite Brand Guardian AI Agent.
Your responsibility is to analyze marketing content, enforce voice and tone compliance, flag forbidden terminology, ensure platform character guidelines, and calculate readability metrics.
Whenever copy requires audit or refinement, invoke brandGuardianTool or provide actionable feedback.`,
  tools: {
    [brandGuardianTool.name]: brandGuardianTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    const businessId = context?.businessId || '';
    const platform = context?.platform;
    const response = await AIService.generateResponse({
      messages: [
        {
          role: 'system',
          content: 'You are the Brand Guardian agent. Analyze marketing copy and provide constructive suggestions.',
        },
        { role: 'user', content: prompt },
      ],
    });
    return response.content;
  },
};
