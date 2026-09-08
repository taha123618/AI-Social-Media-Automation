# Support Guide

Thank you for using and contributing to **SocialAI** (AI Social Media Automation). We are committed to providing a helpful, accessible, and structured support experience for our community and users.

---

## 🧭 How to Get Help

Please choose the appropriate channel below depending on the nature of your request:

### 1. 💬 Questions, Architecture & General Discussion
If you have questions about how to use the platform, configure model providers, design workflows, or build custom AI agents:
- **GitHub Discussions**: Open a topic in [GitHub Discussions](https://github.com/taha123618/AI-Social-Media-Automation/discussions).
- Check existing [Documentation](docs/) and [Architecture Decisions](docs/architecture/decisions/).

### 2. 🐛 Bug Reports
If you found unexpected behavior, crashes, unhandled errors, or regression issues:
- Verify that the issue has not already been reported in the [Issue Tracker](https://github.com/taha123618/AI-Social-Media-Automation/issues).
- Submit a detailed report using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml).
- Include minimal reproduction steps, environment details (Node/Bun version, OS, PostgreSQL version), and relevant logs.

### 3. 💡 Feature Proposals & Enhancements
If you have an idea for an AI agent, tool, workflow, or UI enhancement:
- Open an issue using our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml).
- Describe the problem you are solving, the proposed API or UI changes, and any architectural considerations.

### 4. 🔒 Security Vulnerabilities
If you discover a security vulnerability (e.g., SSRF, authentication bypass, data isolation leak):
- **DO NOT** post details in a public issue or discussion.
- Review our [Security Policy](SECURITY.md) and report the vulnerability privately to our security team.

---

## 📚 Helpful Resources & Documentation

- [Quick Start & Setup Guide](README.md#-quick-start-guide)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Architecture Decisions & ADRs](docs/architecture/decisions/)
- [DevOps Operations Runbook](docs/ops/DEVOPS_RUNBOOK.md)
- [Alerting Runbook](docs/ops/ALERTING_RUNBOOK.md)
- [Disaster Recovery Guide](docs/ops/DISASTER_RECOVERY.md)
- [Project Feature Matrix](FEATURES.md)

---

## ⚡ Frequently Asked Questions (FAQ)

#### Q: How do I switch AI providers between development and production?
In development, the system defaults to OpenRouter to leverage cost-effective multi-model routing. In production, it dynamically switches to direct OpenAI/Anthropic/Gemini endpoints based on the `NODE_ENV` and configured provider credentials. See [ADR 003](docs/architecture/decisions/003-environment-ai-provider-switching.md).

#### Q: Why do BullMQ workers require Redis?
BullMQ uses Redis for asynchronous queue state management, delayed job scheduling, exponential backoff retries, and worker concurrency locks. Make sure Redis 6+ is running locally or via Docker (`docker compose -f docker-compose.dev.yml up -d`).

#### Q: How do I run database migrations?
Run `bun run setup` (or `npx prisma generate && npx prisma migrate deploy`). The database schema is split into domain models under `prisma/models/*.prisma` with the `pgvector` extension enabled.
