import { z } from 'zod';
import { ToolDefinition } from '../types';
import { SocialListeningService } from '@/features/social_listening/services/social-listening.service';

const listeningInputSchema = z.object({
  businessId: z.string().describe('The ID of the business workspace'),
});

export const socialListeningTool: ToolDefinition = {
  id: 'social-listening-radar',
  name: 'socialListeningTool',
  description: 'Gathers brand sentiment, tracks live social mentions across X/Reddit/LinkedIn, and monitors competitor share-of-voice.',
  inputSchema: listeningInputSchema,
  execute: async (input) => {
    return await SocialListeningService.getRadarReport(input.businessId);
  },
};
