---
name: ai-agent-development
description: Use this skill for developing, testing, and maintaining custom AI agents, tools, workflows, and scorers within services/ai/*.
---

# AI Agent Development Skill

You are operating as an AI Agent Engineer responsible for building and maintaining intelligent agents, tools, and multi-step workflows using the custom, zero-dependency AI engine in `services/ai/*`.

## Architecture & Location

- **Core AI Service**: `services/ai/ai.service.ts` (Dynamic OpenRouter in dev, OpenAI in prod)
- **Central Entry Point**: `services/ai/index.ts`
- **Agent Definitions**: `services/ai/agents/*.agent.ts` (16 Autonomous Agents)
- **Tool Definitions**: `services/ai/tools/*.tool.ts` (19 Zod Tools)
- **Workflow Definitions**: `services/ai/workflows/*.workflow.ts` (6 Async Pipelines)
- **Types & Interfaces**: `services/ai/types.ts`

```text
services/ai/
├── agents/                          # 16 Specialized autonomous agents
│   ├── analytics.agent.ts           # Growth & analytics insights
│   ├── blog.agent.ts                # Long-form article ghostwriter & SEO specialist
│   ├── brand-guardian.agent.ts      # Real-time brand voice linter & tone enforcer
│   ├── carousel.agent.ts            # LinkedIn PDF & Instagram swipe deck generator
│   ├── competitor.agent.ts          # Local competitor scanner
│   ├── dm-automation.agent.ts       # Direct message intent classifier & auto-reply
│   ├── engagement.agent.ts          # Social comments and direct messaging
│   ├── multi-location.agent.ts      # Franchise & multi-store coordinator
│   ├── post-creation.agent.ts       # Copywriting & publishing dispatcher
│   ├── review-booster.agent.ts      # Customer reviews & testimonial converter
│   ├── social-listening.agent.ts    # Omnichannel brand mention & sentiment radar
│   ├── template.agent.ts            # 90-day growth blueprints
│   ├── trend-event.agent.ts         # Local calendar & holiday scout
│   ├── voice.agent.ts               # Studio-grade script synthesis for voice narration
│   ├── weather.agent.ts             # Weather-driven marketing
│   ├── youtube.agent.ts             # YouTube channel growth
│   └── index.ts
├── tools/                           # 19 Zod-schema validated tools
│   ├── ad-booster.tool.ts           # Ad creative generation & variant testing
│   ├── analytics.tool.ts            # Cross-platform metric synthesis
│   ├── blog.tool.ts                 # Article generation and SEO scoring
│   ├── brand-guardian.tool.ts       # Jargon detection & reading ease calculation
│   ├── carousel.tool.ts             # Multi-slide visual carousel formatting
│   ├── competitor.tool.ts           # Competitor social performance benchmarking
│   ├── crm-integration.tool.ts      # Lead qualification & CRM sync
│   ├── dm-automation.tool.ts        # Inbound conversation response generation
│   ├── growth-score.tool.ts         # Account health & consistency grading
│   ├── industry-template.tool.ts    # Industry-specific posting playbooks
│   ├── local-event.tool.ts          # Regional event & holiday discovery
│   ├── multi-location.tool.ts       # Multi-branch franchise localization
│   ├── post-creation.tool.ts        # Multi-platform post composition
│   ├── review-booster.tool.ts       # Customer feedback & review reply generation
│   ├── social-engagement.tool.ts    # Comment sentiment & reply generation
│   ├── social-listening.tool.ts     # Brand mention radar & sentiment analysis
│   ├── voice.tool.ts                # Voice narration script & timbre configuration
│   ├── weather.tool.ts              # Local weather conditions & contextual hooks
│   ├── youtube.tool.ts              # Video transcription & repurposing
│   └── index.ts
├── workflows/                       # 6 Multi-step async execution pipelines
│   ├── blog.workflow.ts             # Topic research -> drafting -> SEO audit -> image injection
│   ├── carousel-publishing.workflow.ts # Topic research -> slide styling -> deck validation
│   ├── post-publishing.workflow.ts  # Copy drafting -> compliance audit -> queue dispatch
│   ├── social-listening.workflow.ts # Radar scan -> sentiment aggregation -> executive brief
│   ├── voice-narration.workflow.ts  # Script composition -> timbre mapping -> audio dispatch
│   ├── weather.workflow.ts          # Weather fetch -> promo synthesis -> scheduled post
│   └── index.ts
├── ai.service.ts                    # Environment-aware LLM text generation
├── embedding.service.ts             # Vector embeddings & RAG
├── types.ts                         # TypeScript definitions
└── index.ts                         # Unified export
```

---

## Agent Development Patterns

### 1. Defining an Agent (`services/ai/agents/`)

```typescript
import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { brandGuardianTool } from '../tools';

export const brandGuardianAgent: AgentDefinition = {
  name: 'Brand Voice Guardian Agent',
  instructions: `You are an elite brand guardian. You ensure all copy conforms to tone guidelines, contains no forbidden jargon, and adheres to reading ease benchmarks.`,
  model: 'gpt-4o',
  tools: { brandGuardianTool },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${brandGuardianAgent.instructions}\n\nContext:\n${JSON.stringify(context || {})}\n\nUser Request:\n${prompt}`,
      model: brandGuardianAgent.model,
    });
  },
};
```

### 2. Defining a Tool (`services/ai/tools/`)

All tools must provide an `id`, human-readable `name`, `description`, Zod `inputSchema`, and typed `execute` method:

```typescript
import { z } from 'zod';
import { ToolDefinition } from '../types';

export const carouselTool: ToolDefinition<
  { topic: string; numSlides: number; theme: string },
  { slides: Array<{ title: string; content: string; layout: string }> }
> = {
  id: 'carousel-tool',
  name: 'Carousel Tool',
  description: 'Generates structured multi-slide decks for LinkedIn and Instagram',
  inputSchema: z.object({
    topic: z.string().describe('Carousel core subject'),
    numSlides: z.number().min(3).max(10).default(5),
    theme: z.string().default('MODERN_DARK'),
  }),
  execute: async (input) => {
    // Generate structured slide sequence
    return {
      slides: [
        { title: input.topic, content: 'Hook slide content', layout: 'TITLE' },
      ],
    };
  },
};
```

### 3. Defining a Workflow (`services/ai/workflows/`)

Workflows chain multiple steps asynchronously and return structured output:

```typescript
import { WorkflowDefinition } from '../types';

export const voiceNarrationWorkflow: WorkflowDefinition<
  { script: string; voicePersona: string },
  { status: string; audioUrl?: string }
> = {
  id: 'voice-narration-workflow',
  name: 'Voice Narration Pipeline',
  steps: [
    {
      id: 'step-1-linter',
      description: 'Audit script readability and pacing',
      execute: async (input) => { /* ... */ },
    },
    {
      id: 'step-2-dispatch',
      description: 'Synthesize audio narration via TTS service',
      execute: async (input, ctx) => { /* ... */ },
    },
  ],
  execute: async (input) => {
    const linted = await voiceNarrationWorkflow.steps[0].execute(input);
    const audio = await voiceNarrationWorkflow.steps[1].execute(input, { linted });
    return { status: 'COMPLETED', ...audio };
  },
};
```

---

## Boundaries & Best Practices

1. **Strict Types**: Always use Zod schemas for all tool inputs.
2. **Dynamic AI Switching**: Use `AIService` which transparently routes to OpenRouter in development and OpenAI in production.
3. **Multi-Tenancy**: Enforce `businessId` scoping on any tool that queries Prisma models.
4. **Registration**: Always export all agents, tools, and workflows from `services/ai/index.ts`.
5. **SSRF Guarding**: If a tool makes external HTTP calls to user-supplied URLs, validate them with `SecurityService.validateSafeUrl()`.
