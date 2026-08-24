---
name: ai-agent-development
description: Use this skill for developing, testing, and maintaining Mastra AI agents, tools, workflows, and scorers within the project.
---

# AI Agent Development

You are operating as an AI Agent Engineer responsible for building and maintaining intelligent agents and multi-agent workflows using the Mastra framework.

## Tech Stack & Tooling
- **Framework**: `@mastra/core`, `mastra` CLI
- **Entry Point**: `mastra/index.ts` (root-level Mastra directory)
- **Agent Definitions**: `mastra/agents/*.ts`
- **Tool Definitions**: `mastra/tools/*.ts`
- **Workflow Definitions**: `mastra/workflows/*.ts`
- **Storage**: `MastraCompositeStore` with `@mastra/libsql` (`mastra.db`) and `@mastra/duckdb` (for observability)
- **Observability**: `@mastra/observability` with `SensitiveDataFilter`, `DefaultExporter`, `CloudExporter`
- **Logger**: `@mastra/loggers` (`PinoLogger`)

## Architecture & Directory Structure
```text
mastra/
  index.ts                    # Central initialization and registration of agents, workflows, storage, and loggers
  agents/
    analytics-agent.ts        # Performance metrics and data analysis
    blog-agent.ts             # AI blog writer and SEO optimization agents
    competitor-agent.ts       # Competitor analysis and insights
    engagement-agent.ts       # Comment, reply, and interaction management
    multi-location-agent.ts   # Multi-location business coordination
    post-creation-agent.ts    # Post generation and publishing agents
    review-booster-agent.ts   # Review request generation and sentiment analysis
    template-agent.ts         # Template curation and tone matching
    trend-event-agent.ts      # Trending topic and event detection
    weather-agent.ts          # Weather-driven content generation
    youtube-agent.ts          # Video transcript extraction and summarization
  tools/
    analytics-tool.ts         # Tooling for querying analytics data
    social-engagement-tool.ts # Platform engagement tools
    weather-tool.ts           # Open-Meteo API integrations
    youtube-tool.ts           # YouTube Data API integrations
  workflows/
    blog-workflow.ts          # Multi-step blog generation and SEO audit pipeline
    post-publishing-workflow.ts # Automated multi-platform post publishing pipeline
    weather-workflow.ts       # Weather trigger to post generation pipeline
```

## Core Principles

### 1) Agent Configuration
- Define clear, bounded system instructions.
- Set appropriate `model` provider (`openai`, `anthropic`, `google`, `groq`, `openrouter`).
- Explicitly attach only necessary tools to each agent.
- Keep agent responsibility focused on a single domain.

```typescript
import { Agent } from '@mastra/core/agent';

export const analyticsAgent = new Agent({
  name: 'analyticsAgent',
  instructions: `You are an expert social media analytics strategist.
Analyze engagement metrics, detect audience patterns, and generate actionable growth recommendations.
Only return structured insights backed by data from provided tools.`,
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o',
  },
  tools: {
    // Registered tools
  },
});
```

### 2) Tool Development
- Every tool must specify `id`, `description`, `inputSchema` (Zod), and `outputSchema` (Zod).
- Tools must be stateless, handle failures gracefully, and return typed structures.

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const fetchMetricsTool = createTool({
  id: 'fetch-metrics-tool',
  description: 'Fetches historical post metrics for a given business ID and date range',
  inputSchema: z.object({
    businessId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  }),
  outputSchema: z.object({
    impressions: z.number(),
    engagements: z.number(),
    clicks: z.number(),
  }),
  execute: async ({ context }) => {
    // Implementation with error boundary
    return {
      impressions: 1250,
      engagements: 340,
      clicks: 85,
    };
  },
});
```

### 3) Workflow Orchestration
- Use `@mastra/core/workflows` with step chaining (`.step().then().commit()`).
- Validate data between steps using step schemas.

```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const generateStep = createStep({
  id: 'generate-step',
  inputSchema: z.object({ topic: z.string(), tone: z.string() }),
  outputSchema: z.object({ content: z.string() }),
  execute: async ({ context }) => {
    return { content: `Draft content for ${context.topic}` };
  },
});

export const contentWorkflow = createWorkflow({
  name: 'content-workflow',
  triggerSchema: z.object({ topic: z.string(), tone: z.string() }),
})
  .step(generateStep)
  .commit();
```

## Central Registration (`mastra/index.ts`)
All agents and workflows must be exported from `mastra/index.ts`:

```typescript
export const mastra = new Mastra({
  workflows: {
    weatherWorkflow,
    postPublishingWorkflow,
    analyticsWorkflow,
    scheduledPostingWorkflow,
    blogGenerationWorkflow,
  },
  agents: {
    weatherAgent,
    youtubeAgent,
    postCreationAgent,
    postPublisherAgent,
    analyticsAgent,
    engagementAgent,
    competitorAgent,
    trendEventAgent,
    templateAgent,
    reviewBoosterAgent,
    multiLocationAgent,
    blogWriterAgent,
    blogSeoAgent,
  },
  // ... storage & observability
});
```

## Review Checklist
- [ ] Agent/Tool/Workflow placed in `mastra/` directory (not `src/mastra/`)
- [ ] Registered in `mastra/index.ts`
- [ ] Zod schema definitions on all tools and triggers
- [ ] No hardcoded API keys or secrets
- [ ] Tested via Mastra Studio (`npm run dev`) or unit tests
- [ ] TypeScript compilation verified (`bun run setup` / `tsc --noEmit`)
