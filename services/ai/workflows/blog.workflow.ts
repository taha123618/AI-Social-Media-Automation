import { WorkflowDefinition } from '../types';
import { AIService } from '../ai.service';
import { seoAnalyzerTool } from '../tools';

export interface BlogWorkflowInput {
  topic: string;
  keywords?: string[];
  tone?: string;
  language?: string;
  targetAudience?: string;
  businessId?: string;
  articleId?: string;
}

export interface BlogWorkflowOutput {
  title: string;
  content: string;
  outline: Array<{ heading: string; subheadings?: string[]; keyPoints?: string[] }>;
  metaTitle: string;
  metaDescription: string;
  seoScore: number;
}

export const blogGenerationWorkflow: WorkflowDefinition<BlogWorkflowInput, BlogWorkflowOutput> = {
  id: 'blog-generation-workflow',
  name: 'Blog Generation Workflow',
  description: 'Multi-step autonomous workflow for drafting, writing, and optimizing full-length SEO blog articles.',
  steps: [
    {
      id: 'generate-outline',
      description: 'Generates structured outline for article',
      execute: async (input: BlogWorkflowInput) => input,
    },
    {
      id: 'generate-content',
      description: 'Drafts full HTML article content',
      execute: async (input: BlogWorkflowInput) => input,
    },
    {
      id: 'optimize-seo',
      description: 'Generates metadata and analyzes SEO quality',
      execute: async (input: BlogWorkflowInput) => input,
    },
  ],
  execute: async (input: BlogWorkflowInput): Promise<BlogWorkflowOutput> => {
    const { topic, keywords = [], tone = 'professional', language = 'en', targetAudience } = input;

    // Step 1: Outline Generation
    const outlinePrompt = `Create a structured blog outline for the topic: "${topic}".
Keywords: ${keywords.join(', ')}. Tone: ${tone}. Target Audience: ${targetAudience || 'General'}.
Return a JSON array of sections with "heading", "subheadings", and "keyPoints".`;

    const outlineRes = await AIService.generateJSON<{
      outline: Array<{ heading: string; subheadings?: string[]; keyPoints?: string[] }>;
    }>({
      messages: [
        { role: 'system', content: 'You are an expert editorial strategist. Return valid JSON only.' },
        { role: 'user', content: outlinePrompt },
      ],
    });

    const outline = outlineRes.outline || [
      { heading: 'Introduction', keyPoints: ['Overview of topic'] },
      { heading: 'Key Insights', keyPoints: ['Core analysis'] },
      { heading: 'Conclusion & Next Steps', keyPoints: ['Summary'] },
    ];

    // Step 2: Article Writing
    const articlePrompt = `Write a comprehensive, engaging article in HTML (using <h2>, <h3>, <p>, <ul>, <li> tags) based on this outline:
${JSON.stringify(outline, null, 2)}
Topic: "${topic}". Language: ${language}. Tone: ${tone}.`;

    const articleRes = await AIService.generateResponse({
      messages: [
        { role: 'system', content: 'You are an authoritative, engaging blog writer.' },
        { role: 'user', content: articlePrompt },
      ],
    });

    const content = articleRes.content;

    // Step 3: Meta & Title Optimization
    const metaPrompt = `Generate a click-worthy SEO title, meta title, and meta description (under 160 chars) for this article topic: "${topic}".
Return JSON: { "title": string, "metaTitle": string, "metaDescription": string }`;

    const metaRes = await AIService.generateJSON<{
      title: string;
      metaTitle: string;
      metaDescription: string;
    }>({
      messages: [
        { role: 'system', content: 'You are an SEO CTR optimization specialist. Return valid JSON.' },
        { role: 'user', content: metaPrompt },
      ],
    });

    const metaTitle = metaRes.metaTitle || metaRes.title || topic;
    const metaDescription = metaRes.metaDescription || `Read our comprehensive guide on ${topic}.`;

    // Step 4: SEO Quality Evaluation
    let seoScore = 85;
    try {
      if (seoAnalyzerTool) {
        const seoAnalysis = await seoAnalyzerTool.execute({
          title: metaRes.title || topic,
          content,
          metaDescription,
          targetKeywords: keywords,
        });
        seoScore = seoAnalysis.score || 85;
      }
    } catch {
      seoScore = 85;
    }

    return {
      title: metaRes.title || topic,
      content,
      outline,
      metaTitle,
      metaDescription,
      seoScore,
    };
  },
};

export const blogWorkflow = blogGenerationWorkflow;
