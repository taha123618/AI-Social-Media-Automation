import { SystemLogger } from '@/features/system/services/logger.service';
import {
  VoiceGenerationInput,
  VoiceGenerationResult,
  VoiceId,
  VoiceProfile,
  AVAILABLE_VOICES,
} from '../types/voice.types';

export { AVAILABLE_VOICES };

export class VoiceStudioService {
  /**
   * List all available voices
   */
  static getVoices(): VoiceProfile[] {
    return AVAILABLE_VOICES;
  }

  /**
   * Synthesize audio narration from text
   */
  static async generateNarration(input: VoiceGenerationInput): Promise<VoiceGenerationResult> {
    const {
      businessId,
      text,
      voiceId = 'nova',
      language = 'en-US',
      speed = 1.0,
      targetPlatform = 'INSTAGRAM_REELS',
    } = input;

    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    // Average reading speed: 150 words per minute (2.5 words/sec) adjusted for speed
    const estimatedDurationSeconds = Math.max(1, Math.round(wordCount / (2.5 * speed)));

    let audioUrl = '';
    let source: 'openai_tts' | 'speech_synthesis' = 'speech_synthesis';

    try {
      // Check if OpenAI TTS API Key is available
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && !apiKey.startsWith('mock_')) {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: voiceId,
            speed,
          }),
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64Audio = Buffer.from(buffer).toString('base64');
          audioUrl = `data:audio/mp3;base64,${base64Audio}`;
          source = 'openai_tts';
        }
      }
    } catch (err) {
      console.warn('[VOICE STUDIO] OpenAI TTS fetch error, falling back to speech synthesis:', err);
    }

    const result: VoiceGenerationResult = {
      id: `voice_${Date.now()}`,
      businessId,
      audioUrl,
      spokenText: text,
      durationSeconds: estimatedDurationSeconds,
      wordCount,
      voiceId,
      speed,
      language,
      format: 'mp3',
      source,
      createdAt: new Date().toISOString(),
    };

    await SystemLogger.logActivity({
      action: 'VOICE_NARRATION_GENERATED',
      entity: 'VoiceStudio',
      businessId,
      details: {
        voiceId,
        wordCount,
        durationSeconds: estimatedDurationSeconds,
        targetPlatform,
        source,
      },
    });

    return result;
  }
}
