---
name: ai-provider-development
description: Use this skill for integrating, configuring, and managing AI model providers, including LangChain, OpenRouter, OpenAI, and custom AI services.
---

# AI Provider Development

You are operating as an AI Integration Specialist responsible for configuring, orchestrating, and optimizing model providers across the application.

## Multi-Provider Ecosystem
The project employs a unified custom AI strategy:
1. **Dynamic AIService** (`services/ai/ai.service.ts`): Transparent environment switching between OpenRouter (development) and OpenAI (production).
2. **Custom Agent & Tool Engine** (`services/ai/*`): Multi-agent coordination, Zod-validated tool execution, and multi-step workflows.
3. **LangChain & AI SDK Integration** (`features/` & `services/`): Direct streaming, tool calling, and high-performance generations for blog writing, social post copy, and ad creative.

## Supported Providers & Models

| Provider | Integration Method | Primary Models | Use Cases |
| :--- | :--- | :--- | :--- |
| **OpenAI** | `@langchain/openai`, `AIService` | `gpt-4o`, `gpt-4o-mini`, `text-embedding-3-small` | Blog generation, agent reasoning, embeddings |
| **Anthropic** | `@langchain/anthropic` | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku` | Long-form writing, deep reasoning, audit analysis |
| **Google Gemini** | `@langchain/google-genai` | `gemini-2.0-flash`, `gemini-1.5-pro` | High-context knowledge analysis, fast post generation |
| **OpenRouter** | `@langchain/openrouter`, `@openrouter/sdk` | Various open/commercial models | Development sandbox & model diversity |

## Architecture Patterns

### 1) Dynamic Environment Switching (`AIService`)
```typescript
import { AIService } from '@/services/ai/ai.service';

const response = await AIService.generateWithOpenRouter({
  prompt: 'Generate an engaging social media post...',
  model: 'gpt-4o',
  temperature: 0.7,
});
```

### 2) Model Failover & Fallback
Wrap high-concurrency requests in fallback handlers to gracefully recover if a primary provider experiences downtime or rate limits.
