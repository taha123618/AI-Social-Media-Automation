import { AgentDefinition } from '../types';
import { voiceStudioTool } from '../tools/voice.tool';
import { AIService } from '../ai.service';

export const voiceAgent: AgentDefinition = {
  name: 'voiceAgent',
  instructions: `You are an elite Audio Producer & Voiceover Director AI Agent.
Your mission is to polish spoken scripts for maximum auditory cadence, emotional inflection, and natural phrasing.
When generating narrations for TikTok, Reels, or Podcasts, invoke voiceStudioTool to produce natural sounding audio assets.`,
  tools: {
    [voiceStudioTool.name]: voiceStudioTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    const response = await AIService.generateResponse({
      messages: [
        {
          role: 'system',
          content: 'You are the Voiceover Director agent. Rewrite scripts to sound punchy and natural when spoken aloud.',
        },
        { role: 'user', content: prompt },
      ],
    });
    return response.content;
  },
};
