import { WorkflowDefinition } from '../types';
import { carouselTool } from '../tools/carousel.tool';
import { brandGuardianTool } from '../tools/brand-guardian.tool';

export interface CarouselWorkflowInput {
  businessId: string;
  topic: string;
  slideCount?: number;
  theme?: 'MODERN_DARK' | 'GRADIENT_PURPLE' | 'MINIMAL_LIGHT' | 'SUNSET_ORANGE' | 'CYBERPUNK_NEON' | 'FOREST_EMERALD';
  targetPlatform?: 'LINKEDIN' | 'INSTAGRAM';
}

export interface CarouselWorkflowOutput {
  title: string;
  slidesCount: number;
  caption: string;
  hashtags: string[];
  isBrandCompliant: boolean;
  brandAuditScore: number;
  slides: Array<{ slideNumber: number; layout: string; headline: string; bodyText?: string }>;
}

export const carouselPublishingWorkflow: WorkflowDefinition<
  CarouselWorkflowInput,
  CarouselWorkflowOutput
> = {
  id: 'carousel-publishing-workflow',
  name: 'Carousel Publishing & Brand Guard Workflow',
  description: 'Autonomous multi-step pipeline for generating visual slide decks and validating copy against brand guidelines.',
  steps: [
    {
      id: 'synthesize-slides',
      description: 'Generates structured carousel slide deck using AI design layout models',
      execute: async (input: CarouselWorkflowInput) => input,
    },
    {
      id: 'audit-brand-compliance',
      description: 'Lints captions and slide headlines for brand voice and readability',
      execute: async (input: CarouselWorkflowInput) => input,
    },
  ],
  execute: async (input: CarouselWorkflowInput): Promise<CarouselWorkflowOutput> => {
    // Step 1: Generate Carousel Deck
    const deck = await carouselTool.execute({
      businessId: input.businessId,
      topic: input.topic,
      slideCount: input.slideCount || 5,
      theme: input.theme || 'MODERN_DARK',
      targetPlatform: input.targetPlatform || 'LINKEDIN',
    });

    // Step 2: Audit Deck Caption & Headlines via Brand Guardian
    const fullTextToAudit = `${deck.caption}\n${deck.slides.map((s: any) => s.headline).join(' ')}`;
    const audit = await brandGuardianTool.execute({
      businessId: input.businessId,
      text: fullTextToAudit,
      platform: input.targetPlatform || 'LINKEDIN',
    });

    return {
      title: deck.title,
      slidesCount: deck.slides.length,
      caption: deck.caption,
      hashtags: deck.hashtags,
      isBrandCompliant: audit.isCompliant,
      brandAuditScore: audit.overallScore,
      slides: deck.slides.map((s: any) => ({
        slideNumber: s.slideNumber,
        layout: s.layout,
        headline: s.headline,
        bodyText: s.bodyText,
      })),
    };
  },
};
