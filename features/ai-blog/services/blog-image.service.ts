import type {
  ImageRecord,
  SectionImageMatch,
  ImagePlacementConfig,
} from "../types/blog-image.types";
import {
  BlogAIImageService,
  clearGenerationCache,
} from "./blog-ai-image.service";
import type { AIImageResult } from "./blog-ai-image.service";

// ──────────────────────────────────────────────────────────────
// Content extraction
// ──────────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ──────────────────────────────────────────────────────────────
// Section storage — caches generated images per heading
// ──────────────────────────────────────────────────────────────

let sectionImageCache = new Map<string, ImageRecord>();
let pendingGenerations = new Map<string, Promise<ImageRecord | null>>();

function cacheKey(heading: string, content: string, topic: string): string {
  const text = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
  return `${topic}::${heading}::${text}`;
}

export function clearImageCache(): void {
  sectionImageCache = new Map();
  pendingGenerations = new Map();
  clearGenerationCache();
}

function aiResultToRecord(result: AIImageResult): ImageRecord {
  return {
    id: result.id,
    url: result.url,
    alt: result.alt,
    keywords: [],
    width: result.width,
    height: result.height,
    source: "ai-generated",
    aiPrompt: result.prompt,
    revisedPrompt: result.revisedPrompt,
    aiModel: result.model,
  };
}

async function getOrGenerateSectionImage(
  heading: string,
  content: string,
  topic: string,
  keywords: string[],
  visualStyle?: string,
): Promise<ImageRecord | null> {
  const key = cacheKey(heading, content, topic);

  if (sectionImageCache.has(key)) {
    return sectionImageCache.get(key)!;
  }

  // Deduplicate concurrent generation requests for the same section
  if (pendingGenerations.has(key)) {
    return pendingGenerations.get(key)!;
  }

  const promise = (async () => {
    try {
      const result = await BlogAIImageService.generateSectionImage(
        heading,
        content,
        topic,
        keywords,
        { visualStyle },
      );
      const record = aiResultToRecord(result);
      sectionImageCache.set(key, record);
      return record;
    } catch (err) {
      console.error(`[BlogImageService] AI generation failed for "${heading}":`, err);
      return null;
    } finally {
      pendingGenerations.delete(key);
    }
  })();

  pendingGenerations.set(key, promise);
  return promise;
}

// ──────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────

export function getAvailableProviders(): string[] {
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? ["dall-e-3 (OpenRouter)"] : ["dall-e-3 (OpenAI)"];
}

export class BlogImageService {
  static async getSectionImages(
    heading: string,
    content: string,
    topic: string,
    keywords: string[] = [],
    visualStyle?: string,
  ): Promise<ImageRecord | null> {
    return getOrGenerateSectionImage(heading, content, topic, keywords, visualStyle);
  }

  static async getImagesForTopic(
    topic: string,
    _count = 4,
  ): Promise<ImageRecord[]> {
    return [];
  }

  static extractSections(html: string): { heading: string; content: string }[] {
    const sectionRegex = /(<h[1-6][^>]*>.*?<\/h[1-6]>)([\s\S]*?)(?=<h[1-6]|$)/gi;
    const sections: { heading: string; content: string }[] = [];
    let match;

    while ((match = sectionRegex.exec(html)) !== null) {
      const heading = match[1].replace(/<[^>]+>/g, "").trim();
      const content = match[2]?.trim() || "";
      if (heading) sections.push({ heading, content });
    }

    return sections;
  }

  static async generateAllSectionImages(
    html: string,
    topic: string,
    keywords: string[],
    visualStyle?: string,
  ): Promise<Map<string, ImageRecord>> {
    const sections = BlogImageService.extractSections(html);
    const results = new Map<string, ImageRecord>();

    const batch = sections.map(async (section) => {
      try {
        const img = await getOrGenerateSectionImage(
          section.heading,
          section.content,
          topic,
          keywords,
          visualStyle,
        );
        if (img) results.set(section.heading, img);
      } catch (err) {
        console.error(`[BlogImageService] Failed for "${section.heading}":`, err);
      }
    });

    await Promise.all(batch);
    return results;
  }

  static async rebuildSectionImages(
    html: string,
    topic: string,
    keywords: string[] = [],
  ): Promise<Map<string, ImageRecord>> {
    clearImageCache();
    return BlogImageService.generateAllSectionImages(html, topic, keywords);
  }

  static injectImagesIntoContent(
    html: string,
    topicImages: ImageRecord[],
    topic: string,
  ): string {
    const sections = html.split(/(?=<h[1-6])/gi);

    return sections
      .map((section) => {
        const trimmed = section.trim();
        if (!trimmed) return section;

        const headingMatch = trimmed.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
        const heading = headingMatch?.[1]?.replace(/<[^>]+>/g, "").trim() || "";

        if (!heading) return section;

        const sectionImages = topicImages.filter(
          (img) => img.aiPrompt?.includes(heading) || img.alt?.includes(heading),
        );
        const image = sectionImages.length > 0
          ? sectionImages[0]
          : topicImages[simpleHash(heading) % topicImages.length];

        if (!image) return section;

        const hash = simpleHash(heading);
        const styles = [
          "border-radius: 12px; width: 100%; height: auto; object-fit: cover;",
          "box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);",
          "transition: opacity 0.3s ease;",
        ].join(" ");

        const imgAlt = `Illustration for: ${heading}`;

        const imgTag = [
          `<figure class="blog-context-image-wrap" id="section-img-${hash % 10000}" style="margin: 1.5rem 0; position: relative;">`,
          `<img`,
          `  src="${image.url}"`,
          `  alt="${imgAlt}"`,
          `  loading="lazy"`,
          `  style="${styles}"`,
          `  class="blog-context-image"`,
          `  data-section-heading="${heading.replace(/"/g, "&quot;")}"`,
          `/>`,
          image.source === "ai-generated"
            ? `<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:4px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span style="font-size:9px;color:#6b7280">AI-generated</span></div>`
            : "",
          `<figcaption style="font-size: 0.8rem; color: #6b7280; text-align: center; margin-top: 0.5rem; font-style: italic;">`,
          `Illustration for: ${heading}`,
          `</figcaption>`,
          `</figure>`,
        ].join("\n");

        const insertAfter = headingMatch ? headingMatch[0] : null;
        if (insertAfter) {
          const headingEnd = trimmed.indexOf(insertAfter) + insertAfter.length;
          const afterHeading = trimmed.slice(headingEnd).trim();
          if (afterHeading.startsWith("<p")) {
            const firstP = afterHeading.match(/<p[^>]*>.*?<\/p>/);
            if (firstP) {
              const firstPEnd = afterHeading.indexOf(firstP[0]) + firstP[0].length;
              return (
                trimmed.slice(0, headingEnd) +
                "\n" +
                afterHeading.slice(0, firstPEnd) +
                "\n" +
                imgTag +
                "\n" +
                afterHeading.slice(firstPEnd)
              );
            }
          }
          return trimmed.slice(0, headingEnd) + "\n" + imgTag + "\n" + trimmed.slice(headingEnd);
        }

        return section;
      })
      .join("\n");
  }

  static getImageById(id: string): ImageRecord | null {
    return null;
  }

  static clearCache(): void {
    clearImageCache();
  }
}
