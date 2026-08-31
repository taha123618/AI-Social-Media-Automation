import { z } from 'zod';
import { ToolDefinition } from '../types';
import { CarouselService } from '@/features/carousel_builder/services/carousel.service';

const carouselInputSchema = z.object({
  businessId: z.string().describe('The ID of the business workspace'),
  topic: z.string().describe('The topic or subject matter of the carousel'),
  slideCount: z.number().min(3).max(10).optional().describe('Number of slides to generate (3-10)'),
  targetPlatform: z.enum(['LINKEDIN', 'INSTAGRAM', 'TWITTER']).optional().describe('Target social platform'),
  theme: z.enum(['DARK_GLASS', 'CYBER_NEON', 'MINIMAL_LIGHT', 'SUNSET_CORAL', 'EMERALD_GROWTH', 'CORPORATE_BLUE']).optional().describe('Visual slide design theme'),
});

export const carouselTool: ToolDefinition = {
  id: 'carousel-generate-deck',
  name: 'carouselTool',
  description: 'Generates structured visual carousel slide decks with themes, hooks, body content, and CTAs.',
  inputSchema: carouselInputSchema,
  execute: async (input) => {
    return await CarouselService.generateCarouselDeck(input);
  },
};
