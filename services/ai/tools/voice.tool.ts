import { z } from 'zod';
import { ToolDefinition } from '../types';
import { VoiceStudioService } from '@/features/voice_studio/services/voice.service';

const voiceInputSchema = z.object({
  businessId: z.string().describe('The ID of the business workspace'),
  text: z.string().describe('The script or narrative to synthesize into audio voiceover'),
  voiceId: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'adam', 'rachel', 'antoni', 'bella']).optional().describe('Selected AI voice timbre'),
  speed: z.number().min(0.5).max(2.0).optional().describe('Speaking speed rate'),
  targetPlatform: z.enum(['TIKTOK', 'INSTAGRAM_REELS', 'YOUTUBE_SHORTS', 'PODCAST']).optional().describe('Target audio platform'),
});

export const voiceStudioTool: ToolDefinition = {
  id: 'voice-studio-synthesize',
  name: 'voiceStudioTool',
  description: 'Generates studio-grade AI audio voiceovers for social reels, shorts, podcasts, and video ads.',
  inputSchema: voiceInputSchema,
  execute: async (input) => {
    return await VoiceStudioService.generateNarration({
      businessId: input.businessId,
      text: input.text,
      voiceId: input.voiceId || 'nova',
      speed: input.speed || 1.0,
      targetPlatform: input.targetPlatform || 'INSTAGRAM_REELS',
    });
  },
};

export const voiceTool = voiceStudioTool;
