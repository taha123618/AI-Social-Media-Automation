# AI Evaluation & Benchmarking Framework
## SocialAI: Multi-Dimensional Agent Quality, Brand Fidelity & Evaluation Harness

**Document Version:** 2.4.0  
**Status:** Active Quality Gate  
**Domain:** LLM Evaluation, Agent Quality Assurance, Brand Voice Fidelity & Automated Scoring

---

## 1. Evaluation Philosophy & Multi-Dimensional Rubric

To ensure generative outputs maintain enterprise-grade reliability, compliance, and engagement efficacy, SocialAI evaluates AI outputs across **5 core evaluative dimensions**:

```
                               ┌──────────────────────────────────────────────────┐
                               │       SocialAI 5-Dimensional Quality Index       │
                               │                (Score: 0 - 100)                  │
                               └────────────────────────┬─────────────────────────┘
                                                        │
         ┌───────────────────┬──────────────────────────┼───────────────────────────┬───────────────────┐
         ▼                   ▼                          ▼                           ▼                   ▼
┌─────────────────┐ ┌─────────────────┐        ┌─────────────────┐         ┌─────────────────┐ ┌─────────────────┐
│  1. Brand Voice │ │ 2. Format & Cap │        │  3. Readability │         │  4. Engagement  │ │ 5. Hallucination│
│    Fidelity     │ │   Compliance    │        │  & Flow (FKGL)  │         │    Potential    │ │   & Factuality  │
├─────────────────┤ ├─────────────────┤        ├─────────────────┤         ├─────────────────┤ ├─────────────────┤
│ Weight: 30%     │ │ Weight: 20%     │        │ Weight: 15%     │         │ Weight: 20%     │ │ Weight: 15%     │
│ Measures vector │ │ Validates char  │        │ Flesch-Kincaid  │         │ Hook strength,  │ │ Groundedness in │
│ similarity to   │ │ limits, hashtag │        │ Grade Level     │         │ CTA clarity, &  │ │ pgvector brand  │
│ brand DNA chunks│ │ counts, & line  │        │ target: 7th-9th │         │ viral velocity  │ │ knowledge chunks│
│ (Target: >0.82) │ │ break syntax.   │        │ grade reading.  │         │ score (0-100).  │ │ (Target: 100%). │
└─────────────────┘ └─────────────────┘        └─────────────────┘         └─────────────────┘ └─────────────────┘
```

---

## 2. Evaluation Metric Definitions & Calculation Methods

### 2.1 Brand Voice Fidelity Score ($S_{\text{brand}}$)
Measures the cosine similarity between the generated copy embedding ($\vec{E}_{\text{copy}}$) and the centroid of the tenant's active Brand DNA chunks ($\vec{E}_{\text{brand}}$):
$$S_{\text{brand}} = \frac{\vec{E}_{\text{copy}} \cdot \vec{E}_{\text{brand}}}{\|\vec{E}_{\text{copy}}\| \|\vec{E}_{\text{brand}}\|} \times 100$$
- **Passing Threshold:** $\ge 82.0\%$

### 2.2 Format & Platform Constraint Compliance ($S_{\text{format}}$)
Evaluated deterministically via `BrandGuardianTool`:
- **Twitter/X:** Length $\le 280$ characters (or $\le 4,000$ with Premium flag); Hashtags $\le 3$.
- **LinkedIn:** Hook $\le 140$ characters before "see more"; Total length $\le 3,000$ characters.
- **Instagram:** Hashtags between 3 and 15; Captions $\le 2,200$ characters.
- **Deductions:** $-25\%$ per platform limit violation; $-100\%$ if containing banned brand terms.

### 2.3 Readability & Comprehension Score ($S_{\text{readability}}$)
Calculated using the **Flesch-Kincaid Grade Level (FKGL)**:
$$\text{FKGL} = 0.39 \left( \frac{\text{total words}}{\text{total sentences}} \right) + 11.8 \left( \frac{\text{total syllables}}{\text{total words}} \right) - 15.59$$
- Optimal Grade Level for Social Copy: **Grade 7.0 - 9.5**.
- Deviations beyond Grade 12.0 or below Grade 5.0 incur proportional penalties.

### 2.4 Engagement Potential Score ($S_{\text{engagement}}$)
Calculated using the deterministic heuristic engine in `growthScoreTool`:
- Presence of clear Hook/Pattern Interrupt: $+30 \text{ pts}$.
- Value Delivery / Bulleted Structure: $+30 \text{ pts}$.
- Specific Actionable CTA (Call-to-Action): $+25 \text{ pts}$.
- Relevant Hashtag Categorization: $+15 \text{ pts}$.

---

## 3. Automated Benchmarking Harness & AI Model Arena

### 3.1 Model Arena Benchmark Test Suite (`/arena`)
The Model Arena conducts real-time automated comparative benchmarks across identical prompt fixtures:

```
[Benchmark Prompt Fixture] ──┬──> [OpenAI GPT-4o]          ──> [Latency: 1.8s | Tokens: 420 | Quality: 94]
                             ├──> [Claude 3.5 Sonnet]      ──> [Latency: 2.1s | Tokens: 480 | Quality: 96]
                             ├──> [Google Gemini 2.0 Flash] ──> [Latency: 0.9s | Tokens: 410 | Quality: 91]
                             └──> [DeepSeek-R1]            ──> [Latency: 3.4s | Tokens: 510 | Quality: 92]
```

### 3.2 Automated Regression Test Suite (`lib/__tests__/`)
All AI agents, tools, and workflows are subjected to Jest unit and integration tests:
```bash
npm test # Runs all 58 test suites (281 tests)
```
- Validates Zod schema parsers.
- Verifies entitlement and quota consumption state machines.
- Confirms SSRF URL validation and HMAC signature generation.

---

## 4. Human-In-The-Loop (HITL) Feedback & Active Learning

```
[Agent Generates Post Draft] ──> [BrandGuardian Validates Safety & Format]
                                            │
                                            ▼
                           [Queued with PENDING_REVIEW]
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
           [User Approves as is]                          [User Edits Copy]
                     │                                             │
                     ▼                                             ▼
           [Marked High Confidence]                   [Diff Logged in Audit Trail]
                     │                                             │
                     ▼                                             ▼
        [Added to Positive Benchmark]              [Feedback Vectorized & Ingested]
```

---

## 5. Deployment Quality Gates

Before any prompt, agent definition, or workflow modification is merged to `main`:
1. **Zero Type Errors:** `node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit` returns exit code 0.
2. **Zero Mobile Type Errors:** `cd mobile-app && npx tsc --noEmit` returns exit code 0.
3. **100% Test Pass Rate:** All 58 Jest suites (281 tests) and all 40 mobile tests (`bun test`) must pass without failure.
4. **Zod Validation Coverage:** 100% of tool inputs and outputs must be bounded by explicit Zod schemas.
