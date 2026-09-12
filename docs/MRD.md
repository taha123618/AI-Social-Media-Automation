# Model Requirement Document (MRD)
## SocialAI: Multi-Modal Model Specifications, Routing & Inference Guardrails

**Document Version:** 2.4.0  
**Status:** Approved Standard  
**Domain:** Large Language Models (LLMs), Generative Video, Neural Audio & Vector Embeddings

---

## 1. Model Inventory & Selection Matrix

SocialAI integrates a curated selection of foundation models, routing tasks to the optimal model based on latency, reasoning requirements, context window size, and cost efficiency.

```
                                  ┌──────────────────────────────────────────────────┐
                                  │            Unified Model Routing Gateway         │
                                  │              (services/ai/ai.service.ts)         │
                                  └─────────┬──────────────────┬─────────────────────┘
                                            │                  │
                     ┌──────────────────────┴──────┐    ┌──────┴──────────────────────┐
                     ▼                             ▼    ▼                             ▼
         ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
         │    Reasoning & Copy   │   │  Generative Video &   │   │  Vector Embeddings &  │
         │      Foundations      │   │     Neural Audio      │   │    Knowledge Base     │
         ├───────────────────────┤   ├───────────────────────┤   ├───────────────────────┤
         │ • OpenAI GPT-4o       │   │ • Runway Gen-3/4.5    │   │ • text-embedding-3-   │
         │ • Claude 3.5 Sonnet   │   │   (Cinematic Video)   │   │   small (1536-dim)    │
         │ • Gemini 2.0 Flash    │   │ • ElevenLabs Neural   │   │ • pgvector Cosine     │
         │ • DeepSeek-R1         │   │   v2.5 (Voiceover)    │   │   Distance Operator   │
         │ • GPT-4o-mini (Dev)   │   │ • Flux.1 / SDXL       │   │   (<=>) Indexing      │
         └───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

### 1.1 Foundation LLMs
| Model Identifier | Provider | Primary Use Case | Context Window | Max Output Tokens | Avg Latency | Cost / 1M In/Out |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`gpt-4o`** | OpenAI | Complex copy synthesis, multi-step workflows, SWOT analysis, tool routing. | 128k Tokens | 4,096 Tokens | 1.8s | $2.50 / $10.00 |
| **`gpt-4o-mini`** | OpenAI | High-velocity comment replies, DM classification, local dev/staging testing. | 128k Tokens | 4,096 Tokens | 0.6s | $0.15 / $0.60 |
| **`claude-3-5-sonnet`** | Anthropic | Long-form technical SEO articles, nuanced brand voice ghostwriting. | 200k Tokens | 8,192 Tokens | 2.2s | $3.00 / $15.00 |
| **`gemini-2.0-flash`** | Google | Real-time social listening summarization, trend radar extraction. | 1,000k Tokens | 8,192 Tokens | 0.9s | $0.10 / $0.40 |
| **`deepseek-r1`** | DeepSeek | Competitive pricing modeling, algorithmic engagement logic. | 64k Tokens | 4,096 Tokens | 3.5s | $0.55 / $2.19 |

### 1.2 Multimodal Generative Models
| Model / Engine | Provider | Modality | Output Quality & Formats | Processing Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Runway Gen-3 / 4.5** | RunwayML | Text/Image-to-Video | 720p / 1080p MP4, 5s - 10s cinematic scenes. | 15s - 35s per scene |
| **ElevenLabs Multilingual v2.5** | ElevenLabs | Text-to-Speech (TTS) | 44.1kHz MP3/WAV, 10 vocal profiles, emotion tags. | 400ms streaming TTFB |
| **Flux.1 Schnell / SDXL** | Black Forest / Stability | Text-to-Image | 1024x1024 to 1080x1920 PNG, custom aspect ratios. | 2.5s - 5.0s |

### 1.3 Embedding & Semantic Representation
- **Model:** `text-embedding-3-small` (OpenAI).
- **Dimensions:** 1536-dimensional dense vector space.
- **Distance Metric:** Cosine Distance (`1 - (A <=> B)` in pgvector).
- **Chunking Strategy:** Fixed 512-token chunks with 64-token overlap, preserving header metadata and section tags.

---

## 2. Agent Hyperparameter & Configuration Matrix

Each of the 16 autonomous agents in `services/ai/agents/` is configured with deterministic hyperparameters tailored to its specific output requirements:

| Agent Name | Recommended Model | Temperature | Top-P | Frequency Penalty | Max Output Tokens |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `postCreationAgent` | `gpt-4o` | `0.75` | `0.90` | `0.30` | 1,200 |
| `blogWriterAgent` | `claude-3-5-sonnet` | `0.60` | `0.85` | `0.20` | 4,000 |
| `brandGuardianAgent` | `gpt-4o-mini` | `0.10` | `0.95` | `0.00` | 800 |
| `carouselAgent` | `gpt-4o` | `0.70` | `0.90` | `0.25` | 1,500 |
| `competitorAgent` | `gpt-4o` | `0.40` | `0.80` | `0.10` | 2,000 |
| `dmAutomationAgent` | `gpt-4o-mini` | `0.30` | `0.90` | `0.00` | 500 |
| `engagementAgent` | `gpt-4o-mini` | `0.80` | `0.95` | `0.40` | 400 |
| `multiLocationAgent` | `gpt-4o` | `0.30` | `0.90` | `0.10` | 1,000 |
| `analyticsAgent` | `gpt-4o` | `0.20` | `0.85` | `0.00` | 1,500 |
| `reviewBoosterAgent` | `gpt-4o` | `0.65` | `0.90` | `0.20` | 800 |
| `socialListeningAgent` | `gemini-2.0-flash` | `0.20` | `0.80` | `0.00` | 1,200 |
| `templateAgent` | `gpt-4o` | `0.50` | `0.85` | `0.15` | 3,000 |
| `trendEventAgent` | `gpt-4o` | `0.70` | `0.90` | `0.20` | 1,000 |
| `voiceAgent` | `gpt-4o` | `0.70` | `0.90` | `0.25` | 1,200 |
| `weatherAgent` | `gpt-4o-mini` | `0.60` | `0.85` | `0.10` | 800 |
| `youtubeAgent` | `gpt-4o` | `0.50` | `0.85` | `0.15` | 2,000 |

---

## 3. Prompt Engineering & System Persona Standards

### 3.1 Standard System Persona Header
Every agent prepends a structured system prompt establishing domain authority, tone constraints, and JSON response formats:
```
You are the [Agent Name] operating within the SocialAI Enterprise Swarm.
Your role: [Domain Responsibility].
Rules:
1. Adhere strictly to the provided Brand DNA knowledge chunks.
2. Never invent unverified product statistics, pricing, or capabilities.
3. Optimize copy formatting strictly for the target social network (e.g. hashtags, line breaks, character caps).
4. Output valid JSON matching the specified Zod schema.
```

### 3.2 Dynamic Context Injection via RAG
When executing content creation, the agent prompt dynamically injects up to 3 relevant context snippets retrieved from the pgvector database:
```
--- BRAND DNA CONTEXT ---
[Retrieved Chunk 1 (Similarity: 0.89)]: "Our tone is authoritative yet empathetic, targeting B2B CTOs..."
[Retrieved Chunk 2 (Similarity: 0.84)]: "Never use generic marketing jargon like 'game-changer' or 'synergy'..."
------------------------
```

---

## 4. Hallucination Mitigation & Output Validation

1. **Deterministic Schema Validation:** If an agent response fails Zod parsing, the error is caught, formatted as a retry feedback prompt, and re-executed once (`maxRetries = 1`).
2. **Brand Guardian Safety Pass:** Any text violating character caps or containing banned brand terms is rejected or automatically flagged in the UI.
3. **Fact-Grounding in pgvector:** Prompts instruct the model to cite retrieved chunk IDs or gracefully report missing context rather than inventing claims.
