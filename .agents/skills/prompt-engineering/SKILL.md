---
name: prompt-engineering
description: Use this skill for designing, testing, and optimizing prompts for AI agents, content generation, and system instructions across the project.
---

# Prompt Engineering Standards

You are operating as an AI Prompt Engineer & LLM Specialist designing robust, structured, and high-conversion prompts for social media, blog writing, ad campaigns, and agent reasoning.

## Core Prompting Architecture

### 1) Structured XML Prompt Pattern
Use distinct XML tags to separate context, brand identity, constraints, examples, and output instructions:

```typescript
export function buildSocialPostPrompt({
  brandName,
  brandTone,
  industry,
  topic,
  platform,
  targetAudience,
}: SocialPromptParams) {
  return `
<brand_context>
  <name>${brandName}</name>
  <industry>${industry}</industry>
  <tone>${brandTone}</tone>
  <target_audience>${targetAudience}</target_audience>
</brand_context>

<task>
  Create an engaging, high-performing post tailored specifically for ${platform}.
  Topic: ${topic}
</task>

<platform_guidelines>
  ${getPlatformGuidelines(platform)}
</platform_guidelines>

<constraints>
  - Do not use generic buzzwords or clickbait.
  - Adhere strictly to the brand tone.
  - Include 2-3 relevant, non-spammy hashtags where appropriate.
  - Include a clear call-to-action (CTA).
</constraints>

<output_format>
  Return a structured JSON object with the following fields:
  - hook: String (The opening attention-grabbing line)
  - body: String (The core message formatted with natural line breaks)
  - cta: String (The call to action)
  - hashtags: Array of strings
</output_format>
`;
}
```

### 2) Structured Output Enforcement
- Combine system prompts with Zod schemas using `generateObject` or `streamObject` from the `ai` SDK to guarantee schema adherence.

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';
import { getLanguageModel } from '@/services/ai-provider-factory';

export async function generateAdVariants(brief: string) {
  const result = await generateObject({
    model: getLanguageModel('openai', 'gpt-4o'),
    schema: z.object({
      headlines: z.array(z.string().max(40)).length(5),
      primaryTexts: z.array(z.string().max(125)).length(3),
      descriptions: z.array(z.string().max(30)).length(3),
      callToAction: z.enum(['LEARN_MORE', 'SIGN_UP', 'GET_OFFER', 'CONTACT_US']),
    }),
    prompt: `Generate high-converting Facebook/Meta ad copy based on this brief: ${brief}`,
  });

  return result.object;
}
```

## Best Practices
- **Few-Shot Examples**: Include 2-3 top-performing historic post examples from `SuccessfulPattern` to guide tone and style.
- **Negative Prompting**: Clearly state forbidden phrases, competitor names, and cliches in `<constraints>`.
- **Token Efficiency**: Strip unnecessary conversational preamble from system instructions.
