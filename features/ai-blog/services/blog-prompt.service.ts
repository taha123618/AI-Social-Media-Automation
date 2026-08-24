/**
 * Blog Prompt Engineering Service
 * Manages all AI prompt templates for blog generation
 */

import type { BlogGenerationConfig, BlogOutline } from "../types/blog.types";

const TONE_INSTRUCTIONS: Record<string, string> = {
  PROFESSIONAL: "Write in a polished, authoritative, and credible tone. Use industry-standard terminology while remaining accessible. Avoid slang.",
  CONVERSATIONAL: "Write as if having a friendly conversation with the reader. Use 'you' and 'we'. Ask rhetorical questions. Keep it natural and engaging.",
  ACADEMIC: "Write in a scholarly, well-researched tone. Cite evidence and use precise language. Maintain objectivity and formality.",
  CASUAL: "Write in a relaxed, informal tone. Use everyday language, contractions, and occasional humor. Make it feel like advice from a friend.",
  PERSUASIVE: "Write to convince the reader. Use power words, emotional triggers, and compelling arguments. Include calls-to-action throughout.",
  STORYTELLING: "Weave narratives and anecdotes throughout. Start with a hook, build tension, and deliver insights through stories.",
  HUMOROUS: "Infuse wit and humor throughout. Use clever wordplay, relatable jokes, and funny analogies. Keep it informative but entertaining.",
  AUTHORITATIVE: "Write as a recognized expert. Use data, facts, and definitive statements. Convey absolute confidence in the subject matter.",
  INSPIRATIONAL: "Write to motivate and uplift. Use aspirational language, success stories, and empowering messages.",
  TECHNICAL: "Write with precision and detail. Include technical specifics, code examples if relevant, and thorough explanations for expert audiences.",
};

export class BlogPromptService {
  /**
   * System prompt for the blog generation AI persona
   */
  static getSystemPrompt(config: BlogGenerationConfig): string {
    const toneInstruction = TONE_INSTRUCTIONS[config.tone] || TONE_INSTRUCTIONS.PROFESSIONAL;

    return `You are an expert SEO content strategist and professional blog writer with 15+ years of experience creating high-ranking, engaging long-form content.

Your writing philosophy:
- Every article should provide genuine value that readers can't easily find elsewhere
- Content should be well-structured for both human readers AND search engine crawlers
- Writing must feel natural, human, and engaging — never robotic or AI-generated
- SEO optimization should enhance readability, never compromise it

TONE INSTRUCTIONS:
${toneInstruction}

LANGUAGE: Write in ${config.language === "en" ? "English" : config.language}.

SEO REQUIREMENTS:
- Naturally incorporate the primary keyword "${config.targetKeywords[0]}" throughout the content
- Use semantic variations and LSI keywords related to: ${config.targetKeywords.join(", ")}
${config.secondaryKeywords?.length ? `- Also incorporate secondary keywords: ${config.secondaryKeywords.join(", ")}` : ""}
- Use proper heading hierarchy (H2, H3) — never skip heading levels
- Include transition sentences between sections
- Write scannable content with short paragraphs (2-4 sentences max)
- Use bullet points and numbered lists where appropriate
- Include a compelling introduction that hooks the reader in the first 2 sentences
- End with a strong conclusion that summarizes key takeaways

ANTI-AI-DETECTION GUIDELINES:
- Vary sentence length — mix short punchy sentences with longer complex ones
- Use colloquial expressions and idioms naturally
- Include personal observations or hypothetical scenarios
- Add unexpected analogies and creative comparisons
- Avoid repetitive sentence structures
- Use contractions naturally (don't, won't, it's)
- Include occasional parenthetical asides
- Reference real-world examples and current trends

${config.businessContext ? `BUSINESS CONTEXT:\n${config.businessContext}` : ""}`;
  }

  /**
   * Generate outline prompt
   */
  static getOutlinePrompt(config: BlogGenerationConfig): string {
    return `Create a detailed, SEO-optimized blog article outline for the topic: "${config.topic}"

Target word count: approximately ${config.wordCountTarget} words
Primary keywords: ${config.targetKeywords.join(", ")}
${config.secondaryKeywords?.length ? `Secondary keywords: ${config.secondaryKeywords.join(", ")}` : ""}

Generate a comprehensive outline with the following JSON structure:
{
  "title": "Click-worthy, SEO-optimized title (include primary keyword near the beginning, max 60 characters)",
  "metaDescription": "Compelling meta description (include primary keyword, 150-160 characters, with a call to action)",
  "sections": [
    {
      "heading": "H2 heading text (include keyword variation where natural)",
      "level": 2,
      "keyPoints": ["Key point 1 to cover", "Key point 2 to cover", "Key point 3 to cover"],
      "targetWordCount": 250,
      "suggestedKeywords": ["keyword to use in this section"]
    }
  ],
  "estimatedWordCount": ${config.wordCountTarget},
  "estimatedReadingTime": ${Math.ceil(config.wordCountTarget / 250)}
}

REQUIREMENTS:
- Include 5-8 H2 sections for a ${config.wordCountTarget}-word article
- Add H3 subsections under complex H2 sections
- First section should be an engaging introduction
- Include a "What is..." or definitional section early on
- Include practical/actionable sections (how-to, tips, best practices)
- Include an FAQ-style section if appropriate
- Last section should be a conclusion with key takeaways
- Each section should have clear, descriptive headings
- Distribute keywords naturally across sections

RESPOND WITH ONLY THE JSON — no markdown fencing, no explanation.`;
  }

  /**
   * Generate full article from outline
   */
  static getArticleGenerationPrompt(outline: BlogOutline, config: BlogGenerationConfig): string {
    const sectionsDescription = outline.sections
      .map((s, i) => `${i + 1}. ${"#".repeat(s.level)} ${s.heading} (~${s.targetWordCount} words)\n   Key points: ${s.keyPoints.join("; ")}`)
      .join("\n");

    return `Write a complete, publication-ready blog article following this outline:

TITLE: ${outline.title}

SECTIONS:
${sectionsDescription}

TARGET WORD COUNT: ${config.wordCountTarget} words (aim for at least 90% of this target)

FORMATTING REQUIREMENTS:
- Output in clean HTML format
- Use <h2> and <h3> tags for headings
- Use <p> tags for paragraphs
- Use <ul>/<ol> and <li> for lists
- Use <strong> for emphasis on key terms
- Use <blockquote> for notable quotes or key takeaways
- Do NOT include <h1> — the title is handled separately
- Do NOT include any document structure tags (html, head, body)

CONTENT REQUIREMENTS:
- Write a compelling hook in the first paragraph — start with a surprising statistic, a bold claim, or a relatable pain point
- Each H2 section should be substantial and self-contained
- Include specific examples, data points, and actionable advice
- Use transition sentences between sections to maintain flow
- Add a brief key takeaway or summary at the end of major sections
- Conclude with a clear summary and call-to-action

RESPOND WITH ONLY THE HTML CONTENT — no markdown fencing, no preamble.`;
  }

  /**
   * Generate titles prompt
   */
  static getTitleGenerationPrompt(topic: string, keywords: string[], count: number, style?: string): string {
    const styleInstruction = style
      ? `Focus on ${style}-style titles (e.g., ${
          style === "listicle" ? '"10 Ways to...", "7 Best..."' :
          style === "howto" ? '"How to...", "A Complete Guide to..."' :
          style === "question" ? '"What is...?", "Why Does...?"' :
          style === "guide" ? '"The Ultimate Guide to...", "Everything You Need to Know About..."' :
          style === "comparison" ? '"X vs Y:", "X or Y: Which is Better?"' :
          '"Breaking:", "New Study Reveals..."'
        })`
      : "Mix different title styles for variety";

    return `Generate ${count} click-worthy, SEO-optimized blog post titles for the topic: "${topic}"

Primary keywords to include: ${keywords.join(", ")}

${styleInstruction}

TITLE REQUIREMENTS:
- Include the primary keyword near the beginning of each title
- Keep titles between 50-60 characters for optimal SERP display
- Use power words (Ultimate, Essential, Proven, Complete, etc.)
- Create curiosity gaps that compel clicks
- Include numbers where appropriate (lists perform well)
- Make each title unique and distinctly different

Respond with a JSON array of strings:
["Title 1", "Title 2", "Title 3"]

RESPOND WITH ONLY THE JSON ARRAY — no markdown fencing.`;
  }

  /**
   * Generate meta title and description
   */
  static getMetaGenerationPrompt(title: string, content: string, keywords: string[]): string {
    const contentPreview = content.substring(0, 2000);

    return `Generate an SEO-optimized meta title and meta description for this blog article.

ARTICLE TITLE: ${title}
PRIMARY KEYWORDS: ${keywords.join(", ")}
CONTENT PREVIEW: ${contentPreview}

REQUIREMENTS:
- Meta Title: 50-60 characters, include primary keyword near the start, make it compelling
- Meta Description: 150-160 characters, include primary keyword, add a call-to-action, create urgency

Respond with JSON:
{
  "metaTitle": "Your meta title here",
  "metaDescription": "Your meta description here"
}

RESPOND WITH ONLY THE JSON — no markdown fencing.`;
  }

  /**
   * Generate FAQ items
   */
  static getFAQGenerationPrompt(topic: string, content: string, keywords: string[], count: number): string {
    const contentPreview = content.substring(0, 3000);

    return `Generate ${count} frequently asked questions and answers related to this blog article.

TOPIC: ${topic}
KEYWORDS: ${keywords.join(", ")}
CONTENT CONTEXT: ${contentPreview}

REQUIREMENTS:
- Questions should be genuine queries people search for on Google
- Target featured snippet optimization (concise, direct answers)
- Include the primary keyword naturally in questions where possible
- Answers should be 2-4 sentences long — informative but concise
- Questions should add value beyond what's already covered in the main article
- Format answers for potential Google "People Also Ask" selection

Respond with a JSON array:
[
  { "question": "Question text?", "answer": "Concise answer text." }
]

RESPOND WITH ONLY THE JSON ARRAY — no markdown fencing.`;
  }

  /**
   * Generate CTA content
   */
  static getCTAGenerationPrompt(topic: string, content: string, businessContext: string | undefined, count: number): string {
    return `Generate ${count} compelling calls-to-action for a blog article about "${topic}".

${businessContext ? `BUSINESS CONTEXT: ${businessContext}` : "CONTEXT: Generic blog CTA — focus on engagement actions like subscribing, sharing, or downloading."}

REQUIREMENTS:
- Each CTA should have a headline, description, and button text
- CTAs should feel natural and non-pushy
- Include a mix of placements: inline (within content), end (conclusion), sidebar
- Use action-oriented language
- Create urgency where appropriate

Respond with a JSON array:
[
  {
    "headline": "CTA headline",
    "description": "Brief description or supporting text",
    "buttonText": "Action button text",
    "placement": "inline|end|sidebar"
  }
]

RESPOND WITH ONLY THE JSON ARRAY — no markdown fencing.`;
  }

  /**
   * Expand a section prompt
   */
  static getExpandSectionPrompt(section: string, context: string | undefined, keywords: string[] | undefined, tone: string): string {
    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.PROFESSIONAL;

    return `Expand and enhance the following blog section with more depth, detail, examples, and supporting information.

ORIGINAL SECTION:
${section}

${context ? `ARTICLE CONTEXT: ${context}` : ""}
${keywords?.length ? `KEYWORDS TO INCORPORATE: ${keywords.join(", ")}` : ""}

TONE: ${toneInstruction}

REQUIREMENTS:
- At least double the original word count
- Add specific examples, data, or case studies
- Include actionable tips or insights
- Maintain the same heading structure
- Output in clean HTML format
- Keep the content natural and engaging

RESPOND WITH ONLY THE EXPANDED HTML CONTENT — no markdown fencing.`;
  }

  /**
   * Rewrite a section prompt
   */
  static getRewriteSectionPrompt(section: string, instruction: string | undefined, tone: string): string {
    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.PROFESSIONAL;

    return `Rewrite the following blog section with improvements.

ORIGINAL SECTION:
${section}

${instruction ? `SPECIFIC INSTRUCTIONS: ${instruction}` : "Improve clarity, engagement, and SEO optimization while maintaining the core message."}

TONE: ${toneInstruction}

REQUIREMENTS:
- Maintain the same approximate length
- Improve readability and flow
- Enhance keyword usage naturally
- Make it more engaging and valuable
- Output in clean HTML format

RESPOND WITH ONLY THE REWRITTEN HTML CONTENT — no markdown fencing.`;
  }

  /**
   * Humanize content prompt
   */
  static getHumanizePrompt(content: string, intensity: "light" | "medium" | "heavy"): string {
    const intensityInstructions = {
      light: "Make subtle adjustments: vary sentence lengths, add occasional contractions, and smooth out robotic transitions.",
      medium: "Significantly rewrite for a natural human feel: add personal touches, colloquialisms, rhetorical questions, unexpected analogies, and varied paragraph structures.",
      heavy: "Completely rewrite to sound like a seasoned writer who is passionate about the topic: add personality, storytelling elements, opinions, humor where appropriate, and unique phrasings that no AI would generate.",
    };

    return `Rewrite the following blog content to make it sound more naturally human-written. Maintain all factual information, key points, and heading structure.

INTENSITY: ${intensityInstructions[intensity]}

ORIGINAL CONTENT:
${content}

SPECIFIC TECHNIQUES:
- Mix short sentences with longer ones
- Add contractions naturally (don't, it's, you'll)
- Include parenthetical asides (like this one)
- Use em-dashes for dramatic pauses — it works great
- Add rhetorical questions to engage the reader
- Include real-world analogies
- Break up long paragraphs
- Use informal transitions ("Here's the thing:", "But wait—", "Now,")
- Add occasional first-person observations

OUTPUT in the same HTML format as the input.

RESPOND WITH ONLY THE HUMANIZED HTML CONTENT — no markdown fencing.`;
  }
}
