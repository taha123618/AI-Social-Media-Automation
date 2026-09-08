import { z } from 'zod';
import { ToolDefinition } from '../types';
import { DMAutomationService } from '@/features/dm_automation/services/dm-automation.service';

const dmInputSchema = z.object({
  businessId: z.string().describe('The ID of the business workspace'),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN']).describe('Social DM platform'),
  senderName: z.string().describe('Name of the person who sent the direct message'),
  messageText: z.string().describe('The content of the incoming message'),
});

export const dmAutomationTool: ToolDefinition = {
  id: 'dm-automation-reply',
  name: 'dmAutomationTool',
  description: 'Classifies intent and drafts autonomous conversational auto-replies for Instagram, LinkedIn, and Facebook DMs.',
  inputSchema: dmInputSchema,
  execute: async (input) => {
    return await DMAutomationService.processIncomingDM(input);
  },
};
