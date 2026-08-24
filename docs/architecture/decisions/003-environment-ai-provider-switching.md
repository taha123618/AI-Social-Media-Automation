# ADR-003: Environment-Based AI Provider Switching

- **Status**: Accepted
- **Date**: 2025-01-01
- **Drivers**: Architecture team

## Context

Development needs flexible access to multiple AI models for testing and experimentation, while production requires stability and reliability. Using a single provider for both environments creates friction:
- Development teams can't easily test different model providers
- Production needs predictable, reliable API behavior
- Cost optimization differs between environments (cheap/fast for dev, quality for prod)

## Options Considered

- **Single provider (OpenAI only)** — Simple but limits dev flexibility and makes multi-model testing difficult
- **Environment-based switching** — OpenRouter (multi-model via single API key) for development; OpenAI direct for production
- **All requests through OpenRouter** — Unified but adds latency and third-party dependency in production

## Decision

OpenRouter for development (multi-model access via single API key); OpenAI for production (direct API). The `AIService` abstraction layer handles routing based on `NODE_ENV`.

## Consequences

- **Positive**: Dev can test cheaper/faster models; production gets direct, reliable OpenAI access; easy to add new providers
- **Negative**: Model names differ between environments (OpenRouter prefixes models with provider); must maintain provider abstraction layer; configuration complexity

## Compliance

- All AI calls MUST go through `AIService` — never call provider SDKs directly in application code
- Model selection MUST check `process.env.NODE_ENV` for environment-appropriate routing
- New providers MUST extend `BaseAIProvider` (in `lib/ai/providers/`)
