# ADR-004: Feature-Based Folder Structure

- **Status**: Accepted
- **Date**: 2025-01-01
- **Drivers**: Architecture team

## Context

The project has multiple features with overlapping concerns (social media, blog, ads, analytics, video, images, etc.). Organizing code by type (all services in one folder, all components in another) creates problems:
- Related code is scattered across the filesystem
- No clear ownership boundaries between features
- Refactoring one feature requires touching many directories
- New developers can't easily understand feature scope

## Options Considered

- **Type-based grouping** (`services/`, `components/`, `workers/` at top level) — Familiar but scatters related code
- **Feature-based grouping** — Each feature is self-contained with its own services, components, workers
- **Hybrid** — Features at top level but shared code extracted — chosen approach

## Decision

Group by feature (not by type). Each feature module under `features/*/` contains its own `services/`, `components/`, `workers/`, `types/`, `hooks/`, `lib/`, and `actions/` subdirectories. Shared cross-cutting code goes in top-level `lib/`, `components/`, `services/`, `utils/`, and `hooks/`.

## Consequences

- **Positive**: Easier feature isolation; clear ownership boundaries; faster onboarding for feature-specific work; promotes team ownership per module
- **Negative**: Some code duplication between features (mitigated by extracting shared code when patterns emerge across 3+ features); slightly more complex import paths

## Compliance

- NEW features MUST follow the `features/{name}/{services,components,workers,types,hooks,lib,actions}/` pattern
- Shared code that would be duplicated across 3+ features MUST be extracted to the top-level `lib/`, `components/`, or `services/` directory
- Cross-feature imports are allowed but should be minimized
