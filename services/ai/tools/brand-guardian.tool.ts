import { z } from 'zod';
import { ToolDefinition } from '../types';
import { BrandGuardianService } from '@/features/brand_guardian/services/brand-guardian.service';

const brandGuardianInputSchema = z.object({
  businessId: z.string().describe('The ID of the business workspace'),
  text: z.string().describe('The marketing copy or post text to audit'),
  platform: z.enum(['TWITTER', 'LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'BLOG']).optional().describe('Target social platform'),
});

export const brandGuardianTool: ToolDefinition = {
  id: 'brand-guardian-audit',
  name: 'brandGuardianTool',
  description: 'Audits marketing copy for brand voice conformity, readability metrics, platform constraints, and forbidden terms.',
  inputSchema: brandGuardianInputSchema,
  execute: async (input) => {
    return await BrandGuardianService.auditCopy(input);
  },
};
