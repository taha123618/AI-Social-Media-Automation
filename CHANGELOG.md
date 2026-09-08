# Changelog

All notable changes to **SocialAI** (AI Social Media Automation) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Standardized open-source repository templates: `LICENSE` (MIT), `CODE_OF_CONDUCT.md`, `SUPPORT.md`, `GOVERNANCE.md`.
- GitHub YAML issue forms for bug reports, feature requests, and documentation feedback.
- Project-tailored pull request template verifying Next.js 16, TypeScript, Prisma, and BullMQ requirements.
- Full responsive coverage audit across mobile (320px–375px), tablet, and desktop viewports.

---

## [0.1.0] - 2026-09-08

### Added
- **Core SaaS Architecture**: Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, and Radix UI.
- **Custom Autonomous AI Engine**: 13 autonomous agents coordinating content generation, weather hooks, YouTube transcription, and multi-location franchises (`services/ai/*`).
- **Dynamic AI Provider Switching**: Seamless environment switching between OpenRouter (dev) and OpenAI/Anthropic/Gemini (prod).
- **Background Queue Infrastructure**: BullMQ 5.68 with Redis, 15 worker queues for content generation, image synthesis, video generation, and scheduled publishing.
- **PostgreSQL & Vector Memory**: PostgreSQL with `pgvector` extension for semantic document ingestion and RAG retrieval.
- **Enterprise Multi-Tenancy**: Organization and business scoping across all Prisma queries and route handlers.
- **Multi-Tenant Billing**: Stripe integration with tiered plans (Free, Starter, Pro, Enterprise), webhook lifecycle handlers, and real-time usage telemetry.
- **AI Blog Writer**: TipTap rich text editor with real-time SEO scoring and Gutenberg/Markdown export serializers.
- **Creative Studio Hub**: Unified multimodal suite integrating Flux Pro image synthesis, video generation, and media gallery.
- **Modern Authentication**: Better Auth integration, Google OAuth 2.0 PKCE, and split-screen Jiro-inspired UI for user and admin login.
- **Perimeter Security Hardening**: Deny-by-default edge proxy, SSRF validation (`validateSafeUrl`), binary magic byte verification, and cryptographic admin JWT secret enforcement.
- **Automated Testing Suite**: 58 comprehensive test suites (281 tests) across auth, security, workers, and business logic.
