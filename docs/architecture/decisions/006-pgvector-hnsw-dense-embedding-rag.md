# ADR-006: PostgreSQL with pgvector & HNSW Indexing for Semantic RAG Memory

- **Status**: Accepted
- **Date**: 2026-03-20
- **Drivers**: Data Architecture & AI Engineering Team

## Context

To eliminate AI hallucinations and ground copy in each tenant's specific Brand DNA, customer reviews, and product documents, SocialAI requires a dense vector storage and semantic similarity search layer. We evaluated external managed vector databases vs leveraging the native `pgvector` extension in our primary PostgreSQL 16/18 database.

## Options Considered

1. **Dedicated External Vector DB (Pinecone / Weaviate / Qdrant):**
   - Specialized vector search features.
   - Requires dual writes, data synchronization pipelines, distributed transaction handling, and separate security boundaries.
2. **PostgreSQL 16/18 with `pgvector` Extension & HNSW Cosine Indexing:**
   - Unified ACID transactions, single database backup, unified multi-tenant isolation (`businessId` foreign keys).
   - High-performance Hierarchical Navigable Small World (HNSW) indexing directly inside PostgreSQL.

## Decision

We chose **PostgreSQL with the `pgvector` extension** storing 1536-dimensional OpenAI `text-embedding-3-small` vector embeddings inside `DocumentChunk`.

## Consequences

- **Positive**: Single data store; cascading deletion on tenant removal automatically purges vector chunks; zero cross-system sync latency; strict tenant isolation via SQL queries.
- **Negative**: Database memory sizing must account for HNSW index RAM residency.

## Compliance

- All vector embeddings MUST be 1536 dimensions.
- Vector searches MUST scope queries by `businessId`.
- Semantic search queries MUST use the cosine distance operator `<=>`.
