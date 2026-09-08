import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { multiLocationTool } from '../tools';

/**
 * Multi-Location Brand Coordinator Agent
 */
export const multiLocationAgent: AgentDefinition = {
  name: 'Multi-Location Brand Coordinator',
  instructions: `You are a Multi-Location Franchise & Enterprise Brand Manager.
Responsibilities:
1. Coordinate brand messaging consistency across multiple store/business locations.
2. Adapt master campaigns to localized regional nuances and addresses.
3. Consolidate and compare multi-location engagement and conversion metrics.`,
  model: 'gpt-4o',
  tools: {
    multiLocationTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${multiLocationAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: multiLocationAgent.model,
    });
  },
};
