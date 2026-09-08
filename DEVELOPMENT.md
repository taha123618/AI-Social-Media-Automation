# Local Development & Onboarding Guide 💻

Welcome to the **SocialAI** development guide. This document provides everything you need to set up your local development environment, run the web app and background workers, develop the mobile companion app, and execute automated test suites.

---

## 1. System Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `>= 22.18.0`
- **Bun**: `>= 1.0.0` (recommended for script and server execution)
- **Docker & Docker Compose**: For local PostgreSQL, Redis, and observability services
- **Git**: For version control

For mobile development:
- **Expo CLI**: Installed via `bunx` or `npx`
- **Xcode** (macOS only, for iOS simulator) or **Android Studio** (for Android emulator)

---

## 2. Environment Setup

### 2.1 Clone the Repository
```bash
git clone https://github.com/taha123618/AI-Social-Media-Automation.git
cd AI-Social-Media-Automation
```

### 2.2 Install Dependencies
Install web and root dependencies:
```bash
bun install
# Or: npm install
```

Install mobile companion dependencies:
```bash
cd mobile-app && bun install && cd ..
```

### 2.3 Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the key variables are configured:
```env
# Database & Cache
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_automation?schema=public"
REDIS_URL="redis://localhost:6379"

# Base Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-development-secret-minimum-32-characters"

# AI Providers
OPENROUTER_API_KEY="your-openrouter-key" # Used in development
OPENAI_API_KEY="your-openai-key"         # Used in production

# Storage (AWS S3 or Cloudflare R2)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="test-key"
AWS_SECRET_ACCESS_KEY="test-secret"
AWS_S3_BUCKET="social-automation-media"
```

Also configure `mobile-app/.env`:
```bash
cd mobile-app && cp .env.example .env && cd ..
```

---

## 3. Infrastructure & Database Initialization

### 3.1 Start PostgreSQL & Redis via Docker
```bash
# Start PostgreSQL (with pgvector) and Redis
docker compose up -d postgres redis
```

### 3.2 Run Prisma Migrations & Generate Client
```bash
bun run setup
# This runs: npx prisma generate && npx prisma migrate deploy
```

---

## 4. Running the Development Services

### 4.1 Start the Next.js Web App
```bash
bun run dev
# Next.js App Router starts at http://localhost:3000
```

### 4.2 Start Background Workers & Scheduler
In a separate terminal tab, run the BullMQ workers:
```bash
bun run workers
# Starts posting, blog generation, video polling, and metrics sync workers
```

### 4.3 Start the Mobile Companion App
In a third terminal tab:
```bash
cd mobile-app
bunx expo start
```
- Press `i` to open the iOS simulator.
- Press `a` to open the Android emulator.
- Press `w` to open in your web browser.

---

## 5. Code Quality & Testing Workflows

Always run quality verification checks before opening a pull request or committing changes:

### 5.1 Run Automated Tests (Jest)
SocialAI maintains 58 comprehensive test suites with 281 tests:
```bash
# Run all automated tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test -- features/billing/services/__tests__/entitlement.service.test.ts
```

### 5.2 Run TypeScript Static Analysis
Ensure type safety with adequate memory heap allocation:
```bash
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit
```

### 5.3 Typecheck the Mobile App
```bash
cd mobile-app && npx tsc --noEmit && cd ..
```

### 5.4 Synchronize AI Agent Skills
If you modify or create any agent skills under `.agents/skills/`:
```bash
npm run skills:sync
```

### 5.5 Run Production Build Verification
```bash
npm run build
```

---

## 6. Coding Standards & Conventions

1. **TypeScript Strictness**: Always provide explicit typings for function signatures, props, and API inputs.
2. **Multi-Tenancy**: Every database query on business models must include `where: { businessId }`. Never perform unscoped queries.
3. **SSRF Guard**: Always validate user-submitted URLs with `SecurityService.validateSafeUrl()` before issuing `fetch()`.
4. **Zod Validation**: Validate all Route Handler request bodies with Zod schemas. Return HTTP 400 on failure.
5. **Billing Entitlements**: Use `EntitlementGuard.requireFeature()` and `EntitlementGuard.requireUsageLimit()` before triggering resource-intensive operations.
6. **Mobile First**: Use `@shopify/flash-list` for lists in `mobile-app/` and leverage `useTheme()` for seamless dark mode.
