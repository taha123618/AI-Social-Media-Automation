import { AgentDefinition } from '../types';
import { socialListeningTool } from '../tools/social-listening.tool';
import { AIService } from '../ai.service';

export const socialListeningAgent: AgentDefinition = {
  name: 'socialListeningAgent',
  instructions: `You are an Omnichannel Brand Sentiment & Competitor Radar Intelligence Agent.
Your duty is to detect spikes in brand mentions, flag negative sentiment risks early, identify competitor campaign moves, and generate actionable counter-strategies.`,
  tools: {
    [socialListeningTool.name]: socialListeningTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    const response = await AIService.generateResponse({
      messages: [
        {
          role: 'system',
          content: 'You are the Social Listening Intelligence Agent. Provide sharp, data-backed sentiment analysis.',
        },
        { role: 'user', content: prompt },
      ],
    });
    return response.content;
  },
};
