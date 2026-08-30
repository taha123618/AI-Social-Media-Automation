import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { weatherTool } from '../tools';

/**
 * Weather-Driven Marketing Agent
 */
export const weatherAgent: AgentDefinition = {
  name: 'Weather Marketing Agent',
  instructions: `You are a Weather-Driven Marketing Strategist.
Responsibilities:
1. Inspect live weather conditions and temperature forecasts for a business's primary city.
2. Formulate timely, situational social media posts (e.g., rainy day discounts, sunny patio promotions, winter care tips).
3. Connect weather shifts directly with consumer psychology and relevant product offerings.`,
  model: 'gpt-4o',
  tools: {
    weatherTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${weatherAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: weatherAgent.model,
    });
  },
};
