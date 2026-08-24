import { generateBlogSectionImage } from "../actions/blog-image-generation.actions";

export interface AIImagePrompt {
  sectionHeading: string;
  sectionContent: string;
  blogTopic: string;
  keywords: string[];
  visualStyle: string;
  intent: "explain" | "compare" | "list" | "narrative" | "howto" | "persuade";
  aspectRatio: string;
}

export interface AIImageResult {
  id: string;
  url: string;
  alt: string;
  prompt: string;
  revisedPrompt: string;
  source: "ai-generated";
  width: number;
  height: number;
  model: string;
  cached: boolean;
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  modern: "Clean, modern digital illustration with soft gradients and sharp focus",
  professional: "Professional corporate style with muted tones and clean composition",
  vibrant: "Vibrant, colorful artwork with high contrast and dynamic energy",
  minimal: "Minimalist design with ample negative space and simple shapes",
  cinematic: "Cinematic atmospheric lighting with dramatic depth and rich shadows",
  technical: "Technical diagram style with clean lines and labeled elements",
};

function detectIntent(heading: string, content: string): AIImagePrompt["intent"] {
  const h = heading.toLowerCase();
  const c = content.toLowerCase().slice(0, 200);
  const text = `${h} ${c}`;

  if (text.match(/how\s+to|step|guide|tutorial|walkthrough|instructions?/)) return "howto";
  if (text.match(/vs\.?|versus|comparison|difference|better|worse/)) return "compare";
  if (text.match(/list|top\s+\d+|best|ways|tips|strategies|reasons/)) return "list";
  if (text.match(/what\s+is|explain|understand|definition|meaning|introduction/)) return "explain";
  if (text.match(/persuade|convince|why\s+you|benefits|advantages|reasons?\s+to/)) return "persuade";
  if (text.match(/story|history|evolution|journey|timeline/)) return "narrative";

  return "explain";
}

function buildPrompt(params: AIImagePrompt): string {
  const intentDescriptions: Record<string, string> = {
    explain: "A clear explanatory visual that helps the reader understand the concept",
    compare: "A side-by-side comparison visualization showing the differences and similarities",
    list: "An organized visual representation of multiple items or steps",
    narrative: "A storytelling scene that captures the essence of the journey or process",
    howto: "A step-by-step instructional visual showing the process in action",
    persuade: "An compelling, benefit-focused visual that highlights value and impact",
  };

  const styleGuide = STYLE_DESCRIPTIONS[params.visualStyle] || STYLE_DESCRIPTIONS.modern;
  const intentDesc = intentDescriptions[params.intent];

  const content = params.sectionContent
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);

  const prompt = [
    `Blog Topic: ${params.blogTopic}`,
    `Section Heading: ${params.sectionHeading}`,
    `Section Content: ${content}`,
    `Key Concepts: ${params.keywords.join(", ")}`,
    ``,
    `Create a ${params.aspectRatio} professional blog illustration. ${intentDesc}.`,
    `Style: ${styleGuide}.`,
    `Do not include text, words, or labels in the image.`,
    `Use a clean, high-quality composition suitable for a modern blog post.`,
    `The image should be contextually relevant to ${params.blogTopic} and the section "${params.sectionHeading}".`,
  ].join("\n");

  return prompt;
}

function generateId(): string {
  return `ai-img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ─────────────────────────────────────────────────────────────
// In-memory cache
// ─────────────────────────────────────────────────────────────

const generationCache = new Map<string, AIImageResult>();

function cacheKey(heading: string, content: string, topic: string): string {
  const hash = content
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return `${topic}::${heading}::${hash}`;
}

function getCached(key: string): AIImageResult | undefined {
  return generationCache.get(key);
}

function setCache(key: string, result: AIImageResult): void {
  if (generationCache.size > 100) {
    const firstKey = generationCache.keys().next().value;
    if (firstKey) generationCache.delete(firstKey);
  }
  generationCache.set(key, result);
}

export function clearGenerationCache(): void {
  generationCache.clear();
}

// ─────────────────────────────────────────────────────────────
// API call
// ─────────────────────────────────────────────────────────────

async function callImageAPI(prompt: string, aspectRatio?: string): Promise<{ url: string; revisedPrompt: string }> {
  return generateBlogSectionImage(prompt, { aspectRatio });
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export class BlogAIImageService {
  static async generateSectionImage(
    heading: string,
    content: string,
    topic: string,
    keywords: string[],
    options?: {
      visualStyle?: string;
      aspectRatio?: string;
      forceRegenerate?: boolean;
    },
  ): Promise<AIImageResult> {
    const key = cacheKey(heading, content, topic);

    if (!options?.forceRegenerate) {
      const cached = getCached(key);
      if (cached) return { ...cached, cached: true };
    }

    const intent = detectIntent(heading, content);
    const prompt = buildPrompt({
      sectionHeading: heading,
      sectionContent: content,
      blogTopic: topic,
      keywords,
      visualStyle: options?.visualStyle || "modern",
      intent,
      aspectRatio: options?.aspectRatio || "16:9",
    });

    const { url, revisedPrompt } = await callImageAPI(prompt, options?.aspectRatio);

    const result: AIImageResult = {
      id: generateId(),
      url,
      alt: `Illustration for: ${heading}`,
      prompt,
      revisedPrompt,
      source: "ai-generated",
      width: 1792,
      height: 1024,
      model: "dall-e-3",
      cached: false,
    };

    setCache(key, result);
    return result;
  }

  static async generateAllSectionImages(
    sections: { heading: string; content: string }[],
    topic: string,
    keywords: string[],
    options?: {
      visualStyle?: string;
      aspectRatio?: string;
      forceRegenerate?: boolean;
    },
  ): Promise<Map<string, AIImageResult>> {
    const results = new Map<string, AIImageResult>();

    const batch = sections.map(async (section) => {
      try {
        const img = await BlogAIImageService.generateSectionImage(
          section.heading,
          section.content,
          topic,
          keywords,
          options,
        );
        return { heading: section.heading, image: img };
      } catch (err) {
        console.error(`[BlogAIImage] Failed to generate image for "${section.heading}":`, err);
        return null;
      }
    });

    const resolved = await Promise.all(batch);
    for (const item of resolved) {
      if (item) results.set(item.heading, item.image);
    }

    return results;
  }

  static getCacheSnapshot(): number {
    return generationCache.size;
  }

  static clearCache(): void {
    clearGenerationCache();
  }
}
