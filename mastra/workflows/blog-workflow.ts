import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const blogGenerationWorkflow = createWorkflow({
  id: 'blog-generation-workflow',
  inputSchema: z.object({
    topic: z.string(),
    keywords: z.array(z.string()).default([]),
    tone: z.string().default('PROFESSIONAL'),
    language: z.string().default('en'),
    businessId: z.string().optional(),
    articleId: z.string().optional(),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    outline: z.any(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    seoScore: z.number(),
  }),
});

// Step 1: Generate outline
// inputSchema must match the workflow's inputSchema so the first .then() receives
// the workflow-level input directly.
const generateOutlineStep = createStep({
  id: 'generate-outline',
  description: 'Generates a structured outline for the blog post',
  inputSchema: z.object({
    topic: z.string(),
    keywords: z.array(z.string()).default([]),
    tone: z.string().default('PROFESSIONAL'),
    language: z.string().default('en'),
    businessId: z.string().optional(),
    articleId: z.string().optional(),
  }),
  // Pass through topic/keywords/tone so the next step can use them
  outputSchema: z.object({
    outline: z.any(),
    topic: z.string(),
    keywords: z.array(z.string()),
    tone: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('blogWriterAgent');
    if (!agent) throw new Error('Blog writer agent not found');

    const prompt = `Generate a detailed blog post outline for the topic: "${inputData.topic}".
    Keywords to include: ${inputData.keywords.join(', ')}.
    Tone: ${inputData.tone}.
    Return a structured JSON outline with sections and sub-sections.`;

    const result = await agent.generate([
      { role: 'user', content: prompt }
    ], {
      structuredOutput: {
        schema: z.object({
          outline: z.array(z.object({
            heading: z.string(),
            subheadings: z.array(z.string()).optional(),
            keyPoints: z.array(z.string()).optional(),
          }))
        })
      }
    });

    return {
      outline: result.object.outline,
      topic: inputData.topic,
      keywords: inputData.keywords,
      tone: inputData.tone,
    };
  },
});

// Step 2: Generate full content
// inputSchema must match Step 1's outputSchema
const generateContentStep = createStep({
  id: 'generate-content',
  description: 'Generates the full blog content based on the outline',
  inputSchema: z.object({
    outline: z.any(),
    topic: z.string(),
    keywords: z.array(z.string()),
    tone: z.string(),
  }),
  // Pass through outline and keywords so the next step can use them
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    outline: z.any(),
    keywords: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('blogWriterAgent');
    if (!agent) throw new Error('Blog writer agent not found');

    const prompt = `Write a full blog post for the topic: "${inputData.topic}".
    Using this outline: ${JSON.stringify(inputData.outline)}.
    Keywords to naturally integrate: ${inputData.keywords.join(', ')}.
    Tone: ${inputData.tone}.
    Ensure high engagement and SEO-friendly structure.`;

    const result = await agent.generate([
      { role: 'user', content: prompt }
    ], {
      structuredOutput: {
        schema: z.object({
          title: z.string(),
          content: z.string().describe('The full blog post content in Markdown format'),
        })
      }
    });

    return {
      title: result.object.title,
      content: result.object.content,
      outline: inputData.outline,
      keywords: inputData.keywords,
    };
  },
});

// Step 3: SEO optimization
// inputSchema must match Step 2's outputSchema
const optimizeSeoStep = createStep({
  id: 'optimize-seo',
  description: 'Optimizes content for SEO and generates meta tags',
  inputSchema: z.object({
    title: z.string(),
    content: z.string(),
    outline: z.any(),
    keywords: z.array(z.string()),
  }),
  // Final output matches the workflow's outputSchema
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    outline: z.any(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    seoScore: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('blogSeoAgent');
    if (!agent) throw new Error('SEO agent not found');

    const prompt = `Optimize the following blog post for SEO:
    Title: ${inputData.title}
    Content: ${inputData.content.substring(0, 1000)}...
    Target Keywords: ${inputData.keywords.join(', ')}

    Generate meta title, meta description, and provide an SEO score (0-100).`;

    const result = await agent.generate([
      { role: 'user', content: prompt }
    ], {
      structuredOutput: {
        schema: z.object({
          metaTitle: z.string(),
          metaDescription: z.string(),
          seoScore: z.number(),
        })
      }
    });

    return {
      title: inputData.title,
      content: inputData.content,
      outline: inputData.outline,
      metaTitle: result.object.metaTitle,
      metaDescription: result.object.metaDescription,
      seoScore: result.object.seoScore,
    };
  },
});

blogGenerationWorkflow
  .then(generateOutlineStep)
  .then(generateContentStep)
  .then(optimizeSeoStep);

blogGenerationWorkflow.commit();

export { blogGenerationWorkflow };
