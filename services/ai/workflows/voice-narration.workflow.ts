import { WorkflowDefinition } from '../types';
import { voiceTool } from '../tools/voice.tool';
import { brandGuardianTool } from '../tools/brand-guardian.tool';

export interface VoiceNarrationWorkflowInput {
  businessId: string;
  scriptText: string;
  voiceId?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  targetPlatform?: 'INSTAGRAM_REELS' | 'TIKTOK' | 'YOUTUBE_SHORTS' | 'PODCAST';
}

export interface VoiceNarrationWorkflowOutput {
  audioUrl?: string;
  durationSeconds: number;
  wordCount: number;
  voiceId: string;
  isCompliant: boolean;
  scriptText: string;
}

export const voiceNarrationWorkflow: WorkflowDefinition<
  VoiceNarrationWorkflowInput,
  VoiceNarrationWorkflowOutput
> = {
  id: 'voice-narration-workflow',
  name: 'Voice Narration & Audio Studio Workflow',
  description: 'Autonomous multi-step pipeline for linting spoken script narrative and synthesizing high-fidelity studio voiceovers.',
  steps: [
    {
      id: 'audit-spoken-narrative',
      description: 'Ensures voiceover script adheres to target platform length and brand vocabulary',
      execute: async (input: VoiceNarrationWorkflowInput) => input,
    },
    {
      id: 'synthesize-audio-track',
      description: 'Generates studio audio narration and computes duration telemetry',
      execute: async (input: VoiceNarrationWorkflowInput) => input,
    },
  ],
  execute: async (input: VoiceNarrationWorkflowInput): Promise<VoiceNarrationWorkflowOutput> => {
    // Step 1: Audit Script Narrative
    const audit = await brandGuardianTool.execute({
      businessId: input.businessId,
      text: input.scriptText,
      platform: input.targetPlatform === 'TIKTOK' ? 'TIKTOK' : 'INSTAGRAM',
    });

    // Step 2: Synthesize Voice Track
    const voiceResult = await voiceTool.execute({
      businessId: input.businessId,
      text: input.scriptText,
      voiceId: input.voiceId || 'nova',
      speed: input.speed || 1.0,
      targetPlatform: input.targetPlatform || 'INSTAGRAM_REELS',
    });

    return {
      audioUrl: voiceResult.audioUrl,
      durationSeconds: voiceResult.durationSeconds,
      wordCount: voiceResult.wordCount,
      voiceId: voiceResult.voiceId,
      isCompliant: audit.isCompliant,
      scriptText: input.scriptText,
    };
  },
};
