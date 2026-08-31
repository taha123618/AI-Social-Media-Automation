import { VoiceStudioService, AVAILABLE_VOICES } from '../voice.service';

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
  },
}));

describe('VoiceStudioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVoices', () => {
    it('returns available voice profiles', () => {
      const voices = VoiceStudioService.getVoices();
      expect(voices.length).toBeGreaterThan(0);
      expect(voices.map((v) => v.id)).toContain('nova');
      expect(voices.map((v) => v.id)).toContain('alloy');
    });
  });

  describe('generateNarration', () => {
    it('calculates duration based on word count and speed', async () => {
      const text = 'This is a test script with eight words total.';
      const result = await VoiceStudioService.generateNarration({
        businessId: 'biz_voice_123',
        text,
        voiceId: 'nova',
        speed: 1.0,
      });

      expect(result.businessId).toBe('biz_voice_123');
      expect(result.wordCount).toBe(9);
      expect(result.durationSeconds).toBeGreaterThanOrEqual(1);
      expect(result.audioUrl).toBeDefined();
    });
  });
});
