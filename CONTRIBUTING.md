# 🤝Contributing to AI Social Media Automation

Welcome to our contributor community! This guide establishes the standards and workflows for contributing to the Brand-Aligned Content Engine. Whether you're a human developer or AI assistant, please follow these protocols to maintain code quality, consistency, and scalability.

## Table of Contents

- [System Architecture & Standards](#system-architecture--standards)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [AI & RAG Guidelines](#ai--rag-guidelines)
- [Feature Development](#feature-development)
- [Local Development Setup](#local-development-setup)
- [Code Review Process](#code-review-process)

---

## System Architecture & Standards

Our project follows a **Modular Monolith** architecture designed for scalability and maintainability.

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js with TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Vector Search** | pgvector extension |
| **AI Orchestration** | LangChain.js |
| **Task Queue** | BullMQ + Redis |
| **Async Processing** | Image/Video generation workers |

### Architectural Principles

- **Modular Design**: Each feature module should be independently testable
- **Type Safety**: No `any` types allowed; use strict TypeScript interfaces
- **Separation of Concerns**: Util logic, service logic, and API routes should be clearly separated
- **Error Management**: Use the global `AppError` class for consistent error handling

---

## Coding Standards

### TypeScript & Typing

- **No `any` type**: All functions must have explicit parameter and return types
- **Use TypeScript interfaces** for all data structures
- **Use Zod schemas** for runtime validation of API inputs and AI outputs
- **Strict mode enabled**: All TypeScript strict options must be active

### Code Organization

```
features/
├── module-name/
│   ├── services/          # Business logic
│   ├── components/        # UI components (if applicable)
│   ├── types/            # TypeScript interfaces & types
│   ├── utils/            # Helper functions
│   └── hooks/            # React hooks (if applicable)
```

### Error Handling

All services must implement consistent error handling:

```typescript
import { AppError } from '@/lib/errors';

throw new AppError('User not found', 404, 'USER_NOT_FOUND');
```

### Testing Requirements

- Unit tests for all utility functions
- Integration tests for API routes
- AI parser tests (critical for safety)
- Minimum 80% code coverage for critical paths

---

## Git Workflow

### Branch Naming Convention

```
main                                    → Production releases
development                             → Integration branch
feature/<module>-<description>          → New features
bugfix/<issue-id>-<description>         → Bug fixes
hotfix/<issue-id>-<critical-issue>      → Production hotfixes
```

**Examples:**
```
feature/generation-image-upscaling
bugfix/auth-token-refresh-issue
hotfix/api-rate-limiting-critical
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>
<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples:**
```
feat(generation): add vector search for brand context
fix(scheduler): resolve BullMQ connection timeout
docs(readme): update environment variable setup
refactor(knowledge): improve document chunking logic
```

---

## AI & RAG Guidelines

When working on Knowledge Base or Content Generation modules:

### Document Chunking

- **Strategy**: Sliding window approach
- **Default Chunk Size**: 512 tokens
- **Overlap**: 10% (51 tokens)
- **Tool**: Use `KnowledgeService.chunkDocument()`

### Vector Embeddings

- **Model**: `text-embedding-3-small` (required for consistency)
- **Dimension**: 1536
- **Storage**: pgvector in PostgreSQL
- **Always refresh** embeddings when source documents change

### Safety Guardrails

**CRITICAL**: Every system prompt must include:

> "You are a brand-aligned content specialist. Never hallucinate or invent information about services, products, or business context. Only use information provided in the grounding context."

### Grounding Context Requirements

Every LLM call in content generation must include:

```typescript
const context = await vectorService.search(query, businessId);

if (!context.length) {
  throw new AppError('Insufficient business context', 400);
}

// Include context in prompt
const response = await llm.generate({
  systemPrompt: buildSafePrompt(context),
  userInput: userContent
});
```

---

## Feature Development

### Step-by-Step Workflow

1. **Create Branch**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```

2. **Implement Feature**
   - Write type definitions first
   - Implement service/business logic
   - Add API routes if needed
   - Include unit and integration tests
   - Update TypeScript types

3. **Write Tests**
   ```bash
   npm run test -- --watch
   npm run test:coverage
   ```

4. **Submit Pull Request**
   - Title: `feat(module): descriptive title`
   - Description: Link to issue, explain changes, note breaking changes
   - Push to origin and open PR to `development`

5. **Code Review**
   - Request review from team leads
   - **For AI/RAG changes**: Mandatory human review for prompt safety
   - Address feedback and push updates
   - Resolve conflicts if any

6. **Merge**
   - Squash and merge into `development`
   - Use conventional commit message for merge commit

### Release Process

Releases go through: `development` → `main` with semantic versioning

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ai_social_media_automation
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with:
   - `OPENAI_API_KEY`
   - `AYRSHARE_API_KEY`
   - Database credentials
   - Redis URL

4. **Start Services**
   ```bash
   docker-compose up -d
   ```

5. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:3000`

### Database Management

```bash
# View data
npx prisma studio

# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database (dev only)
npx prisma migrate reset
```

### Redis & BullMQ

```bash
# Start scheduler worker
npm run worker:scheduler

# Start generation worker
npm run worker:generation
```

---

## Code Review Process

### For Contributors

- Keep PRs focused (one feature per PR when possible)
- Write clear commit messages
- Include relevant documentation
- Test before submitting PR
- Respond to feedback promptly

### For Reviewers

- Check for type safety and error handling
- Verify AI/RAG safety guardrails
- Request tests if missing
- Suggest improvements for clarity
- Approve when ready

### Security Review Checklist

- [ ] No hardcoded secrets
- [ ] Proper error messages (no sensitive info leakage)
- [ ] Input validation with Zod
- [ ] SQL injection prevention (Prisma used correctly)
- [ ] RAG grounding context verified
- [ ] No prompt injection vulnerabilities

---

## Questions or Issues?

- Open a discussion in GitHub Discussions
- Join our development Discord
- Check existing issues before creating new ones

Thank you for contributing! 🚀