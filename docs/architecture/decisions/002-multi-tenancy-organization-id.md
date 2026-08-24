# ADR-002: Multi-Tenancy via organizationId with businessId Sub-Scope

- **Status**: Accepted
- **Date**: 2025-01-01
- **Drivers**: Architecture team

## Context

Users can own or belong to multiple businesses under a single organization. This requires a two-level tenant hierarchy to ensure:
- Data isolation between different organizations (e.g., Company A cannot see Company B's data)
- Sub-isolation between businesses within the same organization
- Clear data ownership and access control model

## Options Considered

- **Single-level tenant (organizationId only)** — Simpler queries, but doesn't support users with multiple businesses under one org
- **Two-level hierarchy (Organization → Business)** — More complex queries, but maps to the real business domain
- **Row-level security (PostgreSQL RLS)** — Powerful but harder to debug; Prisma compatibility issues

## Decision

Two-level tenant hierarchy: `Organization → Business`. ALL database queries MUST be scoped by `organizationId`. The `businessId` serves as a sub-scope for operations within an organization.

## Consequences

- **Positive**: Clear data ownership model; natural mapping to business domain; easy to add cross-org features later
- **Negative**: All queries need both scopes; extra JOIN complexity; helper service needed to resolve `organizationId` from `businessId`
- **Mitigation**: `features/multi-location/services/multi-location.service.ts` provides the `resolveOrganizationIdFromBusiness()` helper

## Compliance

- EVERY Prisma query MUST include `where: { business: { organizationId } }` or equivalent scoping
- Code review MUST verify no unscoped queries are introduced
- The `resolveOrganizationIdFromBusiness()` helper MUST be used when only `businessId` is available
