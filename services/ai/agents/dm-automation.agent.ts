import { AgentDefinition } from '../types';
import { dmAutomationTool } from '../tools/dm-automation.tool';
import { AIService } from '../ai.service';

export const dmAutomationAgent: AgentDefinition = {
  name: 'dmAutomationAgent',
  instructions: `You are an autonomous Social Media DM & Lead Capture Bot Agent.
Your mission is to respond instantly to incoming customer messages, resolve product/pricing inquiries, qualify sales leads, and book meetings on calendar links.
Always maintain a friendly, helpful, and brand-aligned persona without sounding robotic.`,
  tools: {
    [dmAutomationTool.name]: dmAutomationTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    const response = await AIService.generateResponse({
      messages: [
        {
          role: 'system',
          content: 'You are the Social DM Agent. Generate concise, high-conversion message replies.',
        },
        { role: 'user', content: prompt },
      ],
    });
    return response.content;
  },
};
