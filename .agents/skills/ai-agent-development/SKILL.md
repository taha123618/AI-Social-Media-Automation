---
name: ai-agent-development
description: Use this skill for developing, testing, and maintaining custom AI agents, tools, workflows, and scorers within services/ai/*.
---

# AI Agent Development Skill

You are operating as an AI Agent Engineer responsible for building and maintaining intelligent agents, tools, and multi-step workflows using the custom, zero-dependency AI engine in `services/ai/*`.

## Architecture & Location

- **Core AI Service**: `services/ai/ai.service.ts` (Dynamic OpenRouter in dev, OpenAI in prod)
- **Central Entry Point**: `services/ai/index.ts`
- **Agent Definitions**: `services/ai/agents/*.agent.ts`
- **Tool Definitions**: `services/ai/tools/*.tool.ts`
- **Workflow Definitions**: `services/ai/workflows/*.workflow.ts`
- **Types & Interfaces**: `services/ai/types.ts`

```
services/ai/
├── agents/                      # Specialized autonomous agents
│   ├── analytics.agent.ts       # Growth & analytics insights
│   ├── blog.agent.ts            # Long-form article ghostwriter & SEO specialist
│   ├── competitor.agent.ts      # Local competitor scanner
│   ├── engagement.agent.ts      # Social comments and direct messaging
│   ├── multi-location.agent.ts  # Franchise & multi-store coordinator
│   ├── post-creation.agent.ts   # Copywriting & publishing dispatcher
│   ├── review-booster.agent.ts  # Customer reviews & testimonial converter
│   ├── template.agent.ts        # 90-day growth blueprints
│   ├── trend-event.agent.ts     # Local calendar & holiday scout
│   ├── weather.agent.ts         # Weather-driven marketing
│   ├── youtube.agent.ts         # YouTube channel growth
│   └── index.ts
├── tools/                       # Zod-schema validated tools
│   ├── ad-booster.tool.ts
│   ├── analytics.tool.ts
│   ├── blog.tool.ts
│   ├── competitor.tool.ts
│   ├── crm-integration.tool.ts
│   ├── growth-score.tool.ts
│   ├── industry-template.tool.ts
│   ├── local-event.tool.ts
│   ├── multi-location.tool.ts
│   ├── post-creation.tool.ts
│   ├── review-booster.tool.ts
│   ├── social-engagement.tool.ts
│   ├── weather.tool.ts
│   ├── youtube.tool.ts
│   └── index.ts
├── workflows/                   # Multi-step async execution pipelines
│   ├── blog.workflow.ts
│   ├── post-publishing.workflow.ts
│   ├── weather.workflow.ts
│   └── index.ts
├── ai.service.ts                # Environment-aware LLM text generation
├── embedding.service.ts         # Vector embeddings & RAG
├── types.ts                     # TypeScript definitions
└── index.ts                     # Unified export
```

## Agent Development Patterns

### 1. Defining an Agent (`services/ai/agents/`)

```typescript
import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { myTool } from '../tools';

export const myAgent: AgentDefinition = {
  name: 'Domain Specialist Agent',
  instructions: `You are an expert in your domain...`,
  model: 'gpt-4o',
  tools: { myTool },
  generateResponse: async (prompt: string, context?: Record<string, any>) => {
    return await AIService.generateWithOpenRouter({
      prompt: `${myAgent.instructions}\n\nContext:\n${JSON.stringify(context || {})}\n\nUser Request:\n${prompt}`,
      model: myAgent.model,
    });
  },
};
```

### 2. Defining a Tool (`services/ai/tools/`)

All tools must have an `id`, human-readable `name`, `description`, Zod `inputSchema`, and typed `execute` method.

```typescript
import { z } from 'zod';
import { ToolDefinition } from '../types';

export const myTool: ToolDefinition<{ location: string }, { result: string }> = {
  id: 'my-tool-id',
  name: 'My Tool',
  description: 'Performs a specific task',
  inputSchema: z.object({
    location: z.string().describe('Target location'),
  }),
  execute: async (input) => {
    // Perform business logic, database queries, or API calls
    return { result: `Processed for ${input.location}` };
  },
};
```

### 3. Defining a Workflow (`services/ai/workflows/`)

Workflows chain multiple steps asynchronously and return structured output.

```typescript
import { WorkflowDefinition } from '../types';

export const myWorkflow: WorkflowDefinition<InputType, OutputType> = {
  id: 'my-workflow-id',
  name: 'My Pipeline',
  steps: [
    {
      id: 'step-1',
      description: 'First processing step',
      execute: async (input) => { /* ... */ },
    },
    {
      id: 'step-2',
      description: 'Second processing step',
      execute: async (input, ctx) => { /* ... */ },
    },
  ],
  execute: async (input) => {
    const step1Out = await myWorkflow.steps[0].execute(input);
    const step2Out = await myWorkflow.steps[1].execute(input, { step1Out });
    return { ...step2Out };
  },
};
```

## Boundaries & Best Practices

1. **Strict Types**: Always use Zod schemas for all tool inputs.
2. **Dynamic AI Switching**: Use `AIService` which transparently routes to OpenRouter in development and OpenAI in production.
3. **Multi-Tenancy**: Enforce `businessId` scoping on any tool that queries Prisma models.
4. **Registration**: Export all agents, tools, and workflows from `services/ai/index.ts`.
