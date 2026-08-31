import { AgentDefinition } from '../types';
import { carouselTool } from '../tools/carousel.tool';
import { AIService } from '../ai.service';

export const carouselAgent: AgentDefinition = {
  name: 'carouselAgent',
  instructions: `You are an elite Carousel & Infographic Content Strategist.
Your mission is to structure complex ideas into punchy, high-retention multi-slide visual decks tailored for LinkedIn PDF carousels, Instagram swipe decks, and Twitter thread slides.
Focus on curiosity-driven hook slides, scannable bullet points, actionable core takeaways, and strong conversion CTAs.`,
  tools: {
    [carouselTool.name]: carouselTool,
  },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    const response = await AIService.generateResponse({
      messages: [
        {
          role: 'system',
          content: 'You are the Carousel Content Strategist agent. Provide slide outlines and hook variations.',
        },
        { role: 'user', content: prompt },
      ],
    });
    return response.content;
  },
};
