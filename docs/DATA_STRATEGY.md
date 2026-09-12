# Data Strategy & Governance Document
## SocialAI: Enterprise Data Architecture, Vector Pipelines & Compliance Framework

**Document Version:** 2.4.0  
**Status:** Approved & Active  
**Domain:** PostgreSQL 16/18, pgvector RAG, Multi-Tenant Storage, GDPR/CCPA Compliance

---

## 1. Data Architecture & Lifecycle Management

SocialAI manages data across 4 discrete tiers: Transactional Relational Data, Dense Vector Embeddings, In-Memory State & Queues, and Object Storage.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA SUBSYSTEM ARCHITECTURE                                   │
├─────────────────────────┬─────────────────────────┬───────────────────┬─────────────────────────┤
│ Tier 1: Relational OLTP │ Tier 2: Vector Store    │ Tier 3: In-Memory │ Tier 4: Object Storage  │
├─────────────────────────┼─────────────────────────┼───────────────────┼─────────────────────────┤
│ PostgreSQL 16/18        │ pgvector (1536-dim)     │ Redis 7 Cluster   │ AWS S3 / Cloudflare R2  │
│ • Users & Workspaces    │ • Brand DNA Docs        │ • BullMQ Queues   │ • Image Generative PNGs │
│ • Social Posts & Queues │ • Semantic Chunks       │ • Token Rate Caps │ • Runway Video MP4s     │
│ • Billing & Subscriptions│ • Cosine Distance Index│ • Session Cache   │ • ElevenLabs Audio MP3s │
│ • Audit & Activity Logs │   (HNSW Operator)       │ • OAuth States    │ • User Brand Uploads    │
└─────────────────────────┴─────────────────────────┴───────────────────┴─────────────────────────┘
```

### 1.1 Data Lifecycle Stages
1. **Ingestion:** User uploads, OAuth token exchanges, and webhook payloads pass through schema validation (`Zod`) and sanitize routines (`SecurityService.sanitizeFilename`).
2. **Processing:** Background workers chunk documents (512 tokens), compute embeddings via OpenAI `text-embedding-3-small`, and index into pgvector.
3. **Storage:** Stored in multi-tenant PostgreSQL tables strictly tagged with foreign key `businessId`.
4. **Retrieval:** Parameterized SQL queries and HNSW vector similarity searches restricted by tenant ID.
5. **Archival & Pruning:** Activity logs older than 90 days are automatically compressed and archived; expired verification tokens are purged daily.
6. **Deletion:** GDPR metadata deletion cascades through all tenant records, deleting cloud S3 assets and database rows.

---

## 2. Multi-Tenant Data Isolation & Partitioning

### 2.1 Logical Partitioning via `businessId`
To prevent cross-tenant data leakage while maintaining operational simplicity, SocialAI utilizes a **Shared Database, Shared Schema with Strict Multi-Tenant Scoping** model:

```sql
-- All tenant tables enforce businessId foreign key relationship
ALTER TABLE "Post" ADD CONSTRAINT "fk_post_business" 
FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE;

-- Indexing strategy guarantees high-throughput scoped reads
CREATE INDEX "idx_post_business_status" ON "Post"("businessId", "status");
CREATE INDEX "idx_document_chunk_business" ON "DocumentChunk"("businessId");
```

### 2.2 Security Invariant: Scoped Query Policy
- Direct queries on tenant models without a `where: { businessId }` clause are prohibited by system guardrails.
- Any API request attempting to query a business ID not present in the user's active `Membership` records receives an immediate `403 Forbidden` response.

---

## 3. Semantic RAG & Vector Embeddings Pipeline

```
[Brand Guidelines PDF / Website URL / Text Note]
                       │
                       ▼
[Text Extraction & Normalization (Markdown / Plaintext)]
                       │
                       ▼
[Semantic Chunking (512 Tokens with 64-Token Overlap)]
                       │
                       ▼
[Embedding Generation (OpenAI text-embedding-3-small -> 1536 Floats)]
                       │
                       ▼
[Insertion into pgvector DocumentChunk with HNSW Cosine Index]
                       │
                       ▼ (Query Phase)
[Input Topic Vectorized -> Vector Cosine Similarity Search (1 - embedding <=> query)]
                       │
                       ▼
[Top-3 Relevant Chunks Injected into Agent Context Window]
```

### 3.1 Cosine Similarity Retrieval (`services/ai/embedding.service.ts`)
```typescript
export class EmbeddingService {
  static async searchSimilarChunks(businessId: string, queryEmbedding: number[], limit = 3): Promise<DocumentChunk[]> {
    const vectorString = `[${queryEmbedding.join(',')}]`;
    return await prisma.$queryRaw<DocumentChunk[]>`
      SELECT id, content, metadata, 1 - (embedding <=> ${vectorString}::vector) AS similarity
      FROM "DocumentChunk"
      WHERE "businessId" = ${businessId}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit};
    `;
  }
}
```

---

## 4. Telemetry & Analytics Ingestion

1. **OAuth Analytics Sync:** BullMQ cron worker queries connected platform Graph APIs (Meta, X, LinkedIn, TikTok) every 6 hours.
2. **Rate-Limit Preservation:** Requests are queued with exponential backoff and jitter to stay well within provider rate limit buckets.
3. **Data Aggregation:** Raw impression, click, and reaction counts are aggregated into daily `AnalyticsOverview` snapshots to minimize database storage overhead.

---

## 5. Compliance, Privacy & Data Governance (GDPR / CCPA)

### 5.1 Automated Data Subject Rights (DSR)
- **Right to Erasure (GDPR Art. 17):** Implemented via `ComplianceService.handleMetaDataDeletion(userEmail)`:
  - Verifies user ownership.
  - Cascades deletion across all User, Membership, Account, and Session records.
  - Deletes S3 assets associated with the user's uploaded files.
  - Logs non-identifiable audit trail: `[COMPLIANCE] Data deletion executed for user: <hash>`.
- **Right of Access & Portability (GDPR Art. 20):** Implemented via `ComplianceService.exportUserData(userEmail)`:
  - Gathers all posts, drafts, analytics, settings, and workspace data.
  - Formats output as structured JSON download.

---

## 6. Backup, High Availability & Disaster Recovery

| Backup Tier | Frequency | Retention | RPO (Recovery Point Objective) | RTO (Recovery Time Objective) |
| :--- | :--- | :--- | :--- | :--- |
| **Continuous WAL Archiving** | Real-Time | 7 Days | $< 1$ Minute | $< 15$ Minutes |
| **Daily Full DB Snapshot** | Every 24 Hours | 30 Days | 24 Hours | $< 30$ Minutes |
| **Object Storage Versioning** | Continuous | 90 Days | Instantaneous | $< 5$ Minutes |
| **Multi-AZ Failover** | Hot Standby | Continuous | $< 10$ Seconds | $< 60$ Seconds |
