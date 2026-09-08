jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    post: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
    socialAccount: { findFirst: jest.fn(), findMany: jest.fn() },
  },
  prisma: {
    systemLog: { create: jest.fn() },
    errorLog: { create: jest.fn() },
    post: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
    socialAccount: { findFirst: jest.fn(), findMany: jest.fn() },
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logInfo: jest.fn(),
    logWarn: jest.fn(),
    logError: jest.fn(),
    logActivity: jest.fn(),
  },
}));

import {
  blogWorkflow,
  weatherWorkflow,
  postPublishingWorkflow,
  scheduledPostingWorkflow,
  analyticsWorkflow,
  carouselPublishingWorkflow,
  socialListeningWorkflow,
  voiceNarrationWorkflow,
} from '../index';

describe('Custom AI Workflows', () => {
  describe('Workflow Structural Definitions', () => {
    it('blogWorkflow defines 3 sequential pipeline steps', () => {
      expect(blogWorkflow.id).toBe('blog-generation-workflow');
      expect(blogWorkflow.steps.length).toBe(3);
      expect(blogWorkflow.steps[0].id).toBe('generate-outline');
      expect(blogWorkflow.steps[1].id).toBe('generate-content');
      expect(blogWorkflow.steps[2].id).toBe('optimize-seo');
    });

    it('weatherWorkflow defines weather fetching and marketing activity steps', () => {
      expect(weatherWorkflow.id).toBe('weather-workflow');
      expect(weatherWorkflow.steps.length).toBe(2);
      expect(weatherWorkflow.steps[0].id).toBe('fetch-weather');
      expect(weatherWorkflow.steps[1].id).toBe('plan-activities');
    });

    it('postPublishingWorkflow defines multi-channel dispatch pipeline', () => {
      expect(postPublishingWorkflow.id).toBe('post-publishing-workflow');
      expect(postPublishingWorkflow.steps.length).toBe(2);
      expect(postPublishingWorkflow.steps[0].id).toBe('validate-draft');
      expect(postPublishingWorkflow.steps[1].id).toBe('publish-platforms');
    });

    it('carouselPublishingWorkflow defines slide synthesis and brand audit steps', () => {
      expect(carouselPublishingWorkflow.id).toBe('carousel-publishing-workflow');
      expect(carouselPublishingWorkflow.steps.length).toBe(2);
      expect(carouselPublishingWorkflow.steps[0].id).toBe('synthesize-slides');
      expect(carouselPublishingWorkflow.steps[1].id).toBe('audit-brand-compliance');
    });

    it('socialListeningWorkflow defines radar scanning and threat assessment steps', () => {
      expect(socialListeningWorkflow.id).toBe('social-listening-workflow');
      expect(socialListeningWorkflow.steps.length).toBe(3);
      expect(socialListeningWorkflow.steps[0].id).toBe('scan-mentions-and-radar');
    });

    it('voiceNarrationWorkflow defines script linting and voice synthesis steps', () => {
      expect(voiceNarrationWorkflow.id).toBe('voice-narration-workflow');
      expect(voiceNarrationWorkflow.steps.length).toBe(2);
      expect(voiceNarrationWorkflow.steps[0].id).toBe('audit-spoken-narrative');
    });

    it('scheduledPostingWorkflow and analyticsWorkflow are valid', () => {
      expect(scheduledPostingWorkflow.id).toBe('scheduled-posting-workflow');
      expect(scheduledPostingWorkflow.steps.length).toBeGreaterThan(0);
      expect(analyticsWorkflow.id).toBe('analytics-sync-workflow');
      expect(analyticsWorkflow.steps.length).toBeGreaterThan(0);
    });
  });
});
