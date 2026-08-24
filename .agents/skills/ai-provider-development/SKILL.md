---
name: ai-provider-development
description: Use this skill for integrating, configuring, and managing AI model providers, including LangChain, OpenRouter, OpenAI, and Mastra AI SDK.
---

# AI Provider Development

You are operating as an AI Integration Specialist responsible for configuring, orchestrating, and optimizing model providers across the application.

## Multi-Provider Ecosystem
The project employs a hybrid AI strategy:
1. **Direct AI SDK & LangChain Integration** (under `features/` & `services/`): Direct streaming, tool calling, and high-performance generations for blog writing, social post copy, and ad creative.
2. **Mastra Agent Framework** (under `mastra/`): Autonomous multi-agent coordination, observability, tool invocation, and multi-step workflows.

## Supported Providers & Models

| Provider | Integration Method | Primary Models | Use Cases |
| :--- | :--- | :--- | :--- |
| **OpenAI** | `@ai-sdk/openai`, `langchain/openai`, `@mastra/core` | `gpt-4o`, `gpt-4o-mini`, `text-embedding-3-small` | Blog generation, agent reasoning, embeddings |
| **Anthropic** | `@ai-sdk/anthropic`, `@langchain/anthropic` | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku` | Long-form writing, deep reasoning, audit analysis |
| **Google Gemini** | `@ai-sdk/google`, `@langchain/google-genai` | `gemini-2.0-flash`, `gemini-1.5-pro` | High-context knowledge analysis, fast post generation |
| **Groq** | Direct API / OpenAI compatibility layer | `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` | Ultra low-latency content drafts |
| **OpenRouter** | OpenAI compatibility wrapper | Various open/commercial models | Failover & provider diversity |
| **Ollama** | `@langchain/community/llms/ollama` | `llama3`, `mistral` | Local offline development and testing |

## Architecture Patterns

### 1) Unified Provider Factory Pattern
Centralize model instantiation to allow seamless switching via environment variables:

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export function getLanguageModel(providerName?: string, modelName?: string) {
  const provider = providerName || process.env.DEFAULT_AI_PROVIDER || 'openai';

  switch (provider.toLowerCase()) {
    case 'anthropic':
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      return anthropic(modelName || 'claude-3-5-sonnet-20241022');
    case 'google':
      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
      return google(modelName || 'gemini-2.0-flash');
    case 'openai':
    default:
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai(modelName || 'gpt-4o');
  }
}
```

### 2) Streaming Response Handlers (Next.js App Router)
```typescript
import { streamText } from 'ai';
import { getLanguageModel } from '@/services/ai-provider-factory';

export async function POST(req: Request) {
  const { prompt, provider, model } = await req.json();
  const selectedModel = getLanguageModel(provider, model);

  const result = streamText({
    model: selectedModel,
    prompt,
    system: 'You are an elite marketing copywriter for high-converting social campaigns.',
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
```

### 3) Error Handling, Retries & Fallbacks
- Implement exponential backoff for rate-limited (HTTP 429) requests.
- Wrap model calls in try-catch with automatic fallback to secondary providers (e.g. OpenAI -> OpenRouter -> Groq).
- Log generation errors via `SystemLogger` with token counts, latency, and error types.

## Security & Best Practices
- Never log raw API keys or client authorization headers.
- Always validate temperature, top_p, and maxTokens constraints before invoking LLMs.
- Enforce output schemas with Zod to prevent prompt injection and hallucinations.
