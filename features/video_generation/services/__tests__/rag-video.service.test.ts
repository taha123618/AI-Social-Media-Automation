import { RagVideoService } from '../rag-video.service';
import { KnowledgeService } from '@/features/knowledge/services/knowledge.service';
import { AIService } from '@/services/ai/ai.service';
import { VideoService } from '../video.service';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/features/knowledge/services/knowledge.service', () => ({
  KnowledgeService: {
    getBrandContext: jest.fn(),
  },
}));

jest.mock('@/services/ai/ai.service', () => ({
  AIService: {
    generateText: jest.fn(),
    generateJSON: jest.fn(),
  },
}));

jest.mock('../video.service', () => ({
  VideoService: {
    generateWithRunway: jest.fn(),
    checkStatus: jest.fn(),
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

describe('RagVideoService', () => {
  const businessId = 'biz_video_rag_1';
  const userId = 'usr_video_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOptimalAspectRatio', () => {
    it('returns square 1:1 for instagram', () => {
      expect((RagVideoService as any).getOptimalAspectRatio('instagram')).toBe('1:1');
    });

    it('returns vertical 9:16 for tiktok and youtube_shorts', () => {
      expect((RagVideoService as any).getOptimalAspectRatio('tiktok')).toBe('9:16');
      expect((RagVideoService as any).getOptimalAspectRatio('youtube_shorts')).toBe('9:16');
    });

    it('returns landscape 16:9 for youtube and linkedin', () => {
      expect((RagVideoService as any).getOptimalAspectRatio('youtube')).toBe('16:9');
      expect((RagVideoService as any).getOptimalAspectRatio('linkedin')).toBe('16:9');
    });
  });

  describe('generateWithRag', () => {
    it('integrates RAG brand context and triggers VideoService.generateWithRunway', async () => {
      (KnowledgeService.getBrandContext as jest.Mock).mockResolvedValue(
        'Brand Name: Apex Shoes. Target Audience: Marathon runners.'
      );
      (AIService.generateJSON as jest.Mock).mockResolvedValue({
        prompt: 'Cinematic close-up of high performance running shoe hitting wet pavement at dawn.',
        style: 'cinematic',
      });
      (VideoService.generateWithRunway as jest.Mock).mockResolvedValue({
        jobId: 'job_vid_123',
        status: 'pending',
      });

      const result = await RagVideoService.generateWithRag({
        businessId,
        userId,
        contentType: 'product demo',
        platform: 'tiktok',
        duration: 10,
        model: 'gen4.5',
      });

      expect(result.jobId).toBe('job_vid_123');
      expect(KnowledgeService.getBrandContext).toHaveBeenCalledWith(businessId, userId);
      expect(VideoService.generateWithRunway).toHaveBeenCalledWith(
        expect.objectContaining({
          aspectRatio: '9:16',
          duration: 10,
        })
      );
      expect(SystemLogger.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'VIDEO_RAG_GENERATION_COMPLETED',
        })
      );
    });
  });
});
