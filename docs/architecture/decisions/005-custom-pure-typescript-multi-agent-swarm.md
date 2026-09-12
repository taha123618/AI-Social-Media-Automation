# ADR-005: Custom Pure TypeScript Multi-Agent Swarm vs External Python/LangChain Runtimes

- **Status**: Accepted
- **Date**: 2026-03-15
- **Drivers**: Core AI Architecture & Backend Engineering Team

## Context

The platform requires 16 autonomous marketing and analytical agents capable of executing deterministic database queries, SEO auditing, brand voice checking, and multi-network publishing workflows. We evaluated whether to host a separate Python-based LangChain/CrewAI/AutoGen microservice or build a unified pure TypeScript agent orchestration engine directly in `services/ai/`.

## Options Considered

1. **Separate Python Microservice (FastAPI + LangChain / CrewAI / LangGraph):**
   - High ecosystem of pre-built community agent connectors.
   - Significant operational overhead (polyglot repository, duplicate type definitions, extra container deployment, inter-service network latency).
2. **Pure TypeScript Deterministic Agent Swarm (`services/ai/`):**
   - Zero additional network hops; seamless TypeScript end-to-end type safety.
   - Strict Zod schema validation on all 19 tool inputs and outputs.
   - Minimal memory footprint, high performance, and direct integration with Prisma ORM and Next.js server actions.

## Decision

We chose to implement a **custom, pure TypeScript multi-agent orchestration engine** under `services/ai/`. All agents (`AgentDefinition`), tools (`ToolDefinition`), and workflows (`WorkflowStep`) are defined with strict TypeScript types and Zod validation schemas.

## Consequences

- **Positive**: Single runtime (Node.js/Bun); zero serialization overhead; unified test suite with Jest (58 suites, 281 tests); 100% deterministic tool execution.
- **Negative**: Custom tool and workflow state machine abstractions had to be built in-house rather than leveraging off-the-shelf framework templates.

## Compliance

- All new agents MUST be registered in `services/ai/index.ts` and `services/ai/agents/index.ts`.
- All tools MUST implement Zod input and output validation schemas.
- Agents MUST utilize `AIService.generateText()` for dynamic provider switching.
