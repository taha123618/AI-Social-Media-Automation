import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { searchCompetitorsTool, analyzeCompetitorTool } from '../tools';

/**
 * Local Competitor Scanner Agent
 * Analyzes local competitors and suggests growth strategies
 */
export const competitorAgent: AgentDefinition = {
  name: 'Local Competitor Scanner',
  instructions: `You are a strategic business analyst specializing in local market growth.
Help small businesses gain a competitive edge by analyzing local competitors' social media presence and growth strategies.
1. Competitor Identification: Identify 3-5 local competitors in the same industry.
2. Performance Analysis: Analyze posting frequency, content styles, and audience engagement.
3. Strategic Recommendation: Suggest concrete positioning to differentiate the user's business.`,
  model: 'gpt-4o',
  tools: {
    searchCompetitorsTool,
    analyzeCompetitorTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${competitorAgent.instructions}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}\n\nUser Request:\n${prompt}`,
      model: competitorAgent.model,
    });
  },
};
