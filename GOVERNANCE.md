# Project Governance & Maintenance Model

## 🏛️ Overview

**SocialAI** (AI Social Media Automation) is an open-source enterprise SaaS platform maintained by a dedicated group of core engineers and community contributors. This document outlines the project's decision-making process, roles and responsibilities, and how community members can participate in shaping the roadmap.

---

## 👥 Roles & Responsibilities

### 1. Maintainers / Core Team
Maintainers are responsible for the overall technical health, security posture, and direction of the repository.

**Responsibilities:**
- Reviewing, testing, and merging Pull Requests.
- Guiding architectural decisions (authoring and reviewing ADRs under `docs/architecture/decisions/`).
- Triaging GitHub issues and managing releases.
- Enforcing the [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md).
- Ensuring 100% test pass rates and strict TypeScript compilation before releases.

### 2. Triage Team & Reviewers
Contributors who actively triage incoming issues, verify bug reproductions, test PRs, and review documentation.

**Responsibilities:**
- Applying issue labels, identifying duplicates, and requesting reproduction steps.
- Performing initial code reviews on community PRs.
- Verifying cross-browser and cross-device responsiveness.

### 3. Contributors
Anyone who submits issues, proposes features, opens pull requests, or improves documentation.

**Guidelines:**
- Adhere to the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).
- Follow the multi-tenancy rules and cybersecurity guardrails outlined in [AGENTS.md](AGENTS.md).

---

## 🔄 Decision-Making Process

- **Minor Changes & Bug Fixes**: Reviewed and merged by any core maintainer upon passing automated CI/CD checks (lint, typecheck, tests, build).
- **Major Features & Architectural Changes**: Require an Architecture Decision Record (ADR) submitted to `docs/architecture/decisions/` and consensus among at least two core maintainers.
- **Security & Breaking Changes**: Subject to heightened review, regression testing, and phased deployment verification.

---

## 🚀 Releases & Versioning

The project follows [Semantic Versioning (SemVer 2.0.0)](https://semver.org/):
- **Major (X.0.0)**: Breaking API or architectural changes, incompatible database migrations.
- **Minor (0.X.0)**: New backward-compatible features, autonomous agents, or workflows.
- **Patch (0.0.X)**: Backward-compatible bug fixes, security patches, and performance optimizations.

All releases are documented in [CHANGELOG.md](CHANGELOG.md).
