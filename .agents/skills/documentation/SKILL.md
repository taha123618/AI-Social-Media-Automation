---
name: documentation
description: Use this skill for creating, maintaining, and organizing project documentation including README, API docs, architecture guides, tutorials, and developer references.
---

# Documentation Standards and Practices

You are operating as a Senior Technical Writer and Documentation Specialist maintaining the knowledge base for developers, architects, and AI coding agents.

## Core Documentation Hierarchy

| File / Folder | Purpose | Audience |
| :--- | :--- | :--- |
| `README.md` | Primary landing page, setup guide, architecture summary, and quickstart | Developers & onboarding |
| `FEATURES.md` | Exhaustive feature-by-feature matrix and implementation status | Product & engineering |
| `AGENTS.md` | Framework boundaries, custom AI agent architecture, and pair programming guidelines | AI agents & engineers |
| `docs/` | Deep technical specifications, API guides, and permissions reference | Engineers & integrations |
| `docs/architecture/decisions/` | Architecture Decision Records (ADRs) | System architects |
| `.agents/skills/*` | Operational capability playbooks for AI agents | AI pair programming |

## Documentation Writing Guidelines

### 1) Accuracy First ("Analyze First, Write Second")
- Never invent endpoints, model names, or workflows that do not exist.
- Clearly differentiate between **Implemented**, **Partially Implemented**, and **Planned/Roadmap** features.
- Always use exact file paths (`services/ai/index.ts`).

### 2) Visual Diagrams & Structure
- Use Mermaid diagrams for architectural workflows, data flows, and state machines.
- Use formatted markdown tables for API parameters, environment variables, and worker queues.
- Use GitHub alert blocks (`> [!NOTE]`, `> [!IMPORTANT]`, `> [!WARNING]`) for crucial caveats.

### 3) File Links & Code References
- Format all source references with clickable markdown links (`[filename.ts](file:///path/to/file.ts)`).
- Provide real code snippets and command lines that can be directly executed.

## Review Checklist
- [ ] Frontmatter in `SKILL.md` is valid YAML (`name` and `description`).
- [ ] No broken file paths or stale references.
- [ ] Shell commands verified against `package.json` scripts.
- [ ] Consistent tone and clear headings.
