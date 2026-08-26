---
name: database-and-migrations
description: Use this skill exclusively for database management, writing Prisma queries, handling migrations, and managing pgvector RAG data.
---

# Database and Migrations

You are operating as a Database Administrator and Prisma Specialist managing PostgreSQL schemas, Prisma 7 ORM models, migrations, and `pgvector` similarity search.

## Tech Stack
- **Database Engine**: PostgreSQL 16+ with `pgvector` extension
- **ORM**: Prisma 7 (`@prisma/client` 7.9.1)
- **Client Output Directory**: `app/generated/prisma`
- **Schema Organization**: `prisma/schema.prisma` datasource config + modular model files in `prisma/models/*.prisma`
- **Migrations Directory**: `prisma/migrations/`

## Schema Structure
The schema is modularly divided across `prisma/models/`:
- `ad.prisma`: Ad accounts, campaigns, ad sets, variants, analytics, and optimization rules.
- `auth.prisma`: Users, accounts, sessions, verification tokens, admins, and audit logs.
- `billing.prisma`: Organizations, subscriptions (`Subscription`), metered usage (`SubscriptionUsage`), feature overrides (`FeatureOverride`), invoices (`BillingInvoice`), and payment webhooks.
- `blog.prisma`: AI blog projects, articles, versions, SEO reports, saved prompts, and templates.
- `business.prisma`: Businesses, members, brands, settings, and invitations.
- `crm.prisma`: Leads, demo leads, bookings, reviews, and review requests.
- `knowledge.prisma`: Knowledge bases, documents, and `KnowledgeChunk` with vector embeddings.
- `social.prisma`: Social accounts, posts, content drafts, schedules, and comments.
- `system.prisma`: Activity logs, error logs, job logs, notifications, and webhooks.
- `video.prisma`: Video jobs, image storage, and third-party media integrations.
- `workflow.prisma`: Custom multi-step automation workflows and executions.

## PostgreSQL & `pgvector` Specifics
- The `vector` extension is enabled: `CREATE EXTENSION IF NOT EXISTS "vector";`
- Vector columns are mapped in Prisma using `Unsupported("vector")`:
```prisma
model KnowledgeChunk {
  id              String                @id @default(cuid())
  content         String
  embedding       Unsupported("vector")
  metadata        Json?
  documentId      String
  knowledgeBaseId String
  document        KnowledgeDocument     @relation(fields: [documentId], references: [id], onDelete: Cascade)
  knowledgeBase   KnowledgeBase         @relation(fields: [knowledgeBaseId], references: [id], onDelete: Cascade)
}
```

### Raw Vector Similarity Queries
For semantic similarity search, execute raw SQL via `prisma.$queryRaw`:
```typescript
import { prisma } from '@/lib/prisma';

export async function findSimilarChunks(
  knowledgeBaseId: string,
  embedding: number[],
  limit = 5
) {
  const vectorString = `[${embedding.join(',')}]`;
  const chunks = await prisma.$queryRaw<
    Array<{ id: string; content: string; similarity: number }>
  >`
    SELECT id, content, 1 - (embedding <=> ${vectorString}::vector) AS similarity
    FROM "KnowledgeChunk"
    WHERE "knowledgeBaseId" = ${knowledgeBaseId}
    ORDER BY embedding <=> ${vectorString}::vector
    LIMIT ${limit};
  `;
  return chunks;
}
```

## Migration Workflows & Commands

```bash
# Generate Prisma Client to app/generated/prisma
bun run prisma:generate

# Apply pending migrations in production / staging
bun run prisma:migrate # or bun run setup

# Reset development database and seed
bun run prisma:seed

# Inspect database via Prisma Studio
bun run prisma:studio
```

## Migration Safety Guidelines
1. **Never edit applied migrations** without rolling them back or writing a new forward migration.
2. Ensure extensions like `vector` do not require non-standard superuser privileges during standard migrations.
3. Always index foreign keys and query filters (`@@index([businessId])`, `@@index([createdAt])`).
4. Avoid destructive column removals (`DROP COLUMN`) without a deprecation phase.