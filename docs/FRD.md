# Functional Requirement Document (FRD)
## SocialAI: Granular Functional Specifications, Tool Schemas & Agent Workflows

**Document Version:** 2.4.0  
**Status:** Approved Specification  
**Scope:** 29 User Modules, Admin Command Center, 16 AI Agents, 19 Tools, 6 Workflows, Mobile App.

---

## 1. 29 User Modules Functional Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 29 USER SaaS DOMAIN MODULES                                     │
├──────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┤
│ Pillar 1: Publishing │ Pillar 2: Studios      │ Pillar 3: Intelligence │ Pillar 4: Operations   │
├──────────────────────┼────────────────────────┼────────────────────────┼────────────────────────┤
│ 1. /dashboard        │ 7.  /image             │ 12. /blog              │ 21. /gallery           │
│ 2. /contents         │ 8.  /videos            │ 13. /ad-campaigns      │ 22. /workflows         │
│ 3. /posts            │ 9.  /voice             │ 14. /competitors       │ 23. /knowledge         │
│ 4. /schedule         │ 10. /carousels         │ 15. /arena             ├────────────────────────┤
│ 5. /post-schedule    │ 11. /studio            │ 16. /trends            │ Pillar 5: Settings     │
│ 6. /inbox            │                        │ 17. /listening         ├────────────────────────┤
│                      │                        │ 18. /reviews           │ 24. /settings/profile  │
│                      │                        │ 19. /multi-location    │ 25. /settings/workspace│
│                      │                        │ 20. /dm-automation     │ 26. /settings/billing  │
│                      │                        │                        │ 27. /settings/team     │
│                      │                        │                        │ 28. /settings/social   │
│                      │                        │                        │ 29. /settings/api-keys │
└──────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## 2. Core Functional Specifications by Module

### 2.1 Module 1: Executive Dashboard (`/dashboard`)
- **Inputs:** Active `businessId` workspace context.
- **Data Dependencies:** `BillingService.getBusinessSubscription()`, `prisma.post.count()`, `prisma.workflow.count()`, `prisma.contentDraft.findMany()`.
- **Outputs:**
  - 4 KPI Metrics: Total Activity (post count + trend), Active Subscription tier, Active Workflows, Support/System Status.
  - Resource Quota Telemetry: Real-time progress bars for Monthly AI Posts, AI Blog Articles, Brand Voice Profiles.
  - Quick Launch Cards: 1-click links to SEO Article Ghostwriter, Workflows, and Composer.
  - Recent Content Activity: Real-time feed of the 4 most recent content drafts with platform badges.
- **Edge Cases:** Unsubscribed/Free tenants display "Free Starter" with upgrade triggers; zero post state shows empty state graphic with "Generate Post" CTA.

### 2.2 Module 2 & 3: Content Library & Post Approval Queue (`/contents`, `/posts`)
- **Inputs:** Status filter (`ALL`, `DRAFT`, `PENDING_REVIEW`, `SCHEDULED`, `PUBLISHED`), Search query, Platform selector.
- **Functional Behaviors:**
  - Filter content items by status tabs with real-time counts.
  - 1-Click Publish Action: Triggers `publishPostMutation` which invokes `SocialMediaService.publishPost()`.
  - Delete Post Action: Displays confirmation dialog and removes record via `deletePostMutation`.
  - View Post Details: Opens slide-over drawer showing platform preview, scheduled time, and character limits.

### 2.3 Module 4 & 5: Visual Content Calendar (`/schedule`, `/post-schedule`)
- **Inputs:** Selected Month/Week date range, timezone offset.
- **Functional Behaviors:**
  - Renders 7-day or 30-day interactive scheduling grid.
  - Peak Time Recommendations: AI analyzes past engagement to highlight optimal posting time slots (e.g., 9:00 AM, 1:30 PM, 6:00 PM).
  - Drag-and-drop or slot selection to reschedule queued posts.

### 2.4 Module 7: Image Diffusion Studio (`/image`)
- **Inputs:** Text prompt, Negative prompt, Aspect ratio (`1:1`, `4:5`, `16:9`, `9:16`), Style preset (`Photorealistic`, `Cinematic`, `Minimalist 3D`, `Cyberpunk`, `Flat Vector`).
- **Processing:** Invokes `AIService` prompt enhancer $\rightarrow$ dispatches generation request to image generation backend $\rightarrow$ stores generated PNG in S3 $\rightarrow$ creates `MediaAsset` record.
- **Outputs:** High-resolution preview image with download, copy URL, and "Attach to Post" action buttons.

### 2.5 Module 8: RAG Video Storyboard Studio (`/videos`)
- **Inputs:** Script theme, Target platform (`tiktok`, `instagram`, `youtube`, `linkedin`), Video style (`cinematic`, `animated`, `minimalist`), Target duration (15s, 30s, 60s).
- **Processing:** `RagVideoService` retrieves brand DNA chunks from pgvector $\rightarrow$ formulates multi-scene prompts $\rightarrow$ dispatches scene jobs to Runway Gen-3/4.5 $\rightarrow$ tracks status.
- **Outputs:** Multi-scene storyboard viewer with scene prompt breakdown and stitched video player.

### 2.6 Module 9: Voice Narration & TTS Studio (`/voice`)
- **Inputs:** Text script, Vocal profile ID (10 voice profiles), Speech speed (0.5x to 2.0x).
- **Processing:** `VoiceStudioService` validates word count against tier quota $\rightarrow$ synthesizes MP3 audio stream via ElevenLabs neural API $\rightarrow$ generates visual waveform array.
- **Outputs:** Audio player with scrub bar, duration meter, waveform visualizer, and MP3 download.

### 2.7 Module 10: Carousel Card Studio (`/carousels`)
- **Inputs:** Carousel topic, Number of slides (3 to 10), Color theme (Dark Slate, Electric Violet, Ocean Blue, Minimal Clean).
- **Processing:** `carouselAgent` + `carouselTool` structures JSON slide deck $\rightarrow$ renders canvas SVG/DOM preview $\rightarrow$ exports multi-page PDF or zip of high-res PNG images.

### 2.8 Module 12: AI Blog & SEO Ghostwriter (`/blog`)
- **Inputs:** Target keyword, Target audience, Word count target (800 - 3,000 words), Tone.
- **Processing:** Executes `blogWorkflow`: Keyword analysis $\rightarrow$ Heading hierarchy generation $\rightarrow$ Gutenberg HTML section drafting $\rightarrow$ `blogTool` calculates SEO score (0-100).
- **Outputs:** Rich WYSIWYG TipTap editor with SEO score sidebar, heading inspector, schema JSON-LD preview, and 1-click HTML clipboard copy.

### 2.9 Module 14 & 15: Competitor Intelligence & AI Model Arena (`/competitors`, `/arena`)
- **Competitors:** Ingests competitor social handles $\rightarrow$ scans public post cadences $\rightarrow$ computes SWOT matrix and counter-strategy opportunities.
- **Arena:** Accepts a benchmark prompt $\rightarrow$ parallelizes requests across GPT-4o, Claude 3.5, Gemini 2.0, DeepSeek-R1 $\rightarrow$ displays side-by-side responses with latency, token count, and lexical score.

---

## 3. Detailed AI Tool Specifications (19 Zod-Validated Tools)

All tools in `services/ai/tools/` implement the strict `ToolDefinition` interface:

### 3.1 `brandGuardianTool` Specification
- **Zod Input Schema:**
  ```typescript
  export const BrandGuardianInputSchema = z.object({
    text: z.string().min(1).max(10000),
    platform: z.enum(['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok']),
    forbiddenWords: z.array(z.string()).optional(),
    maxCharacters: z.number().optional()
  });
  ```
- **Zod Output Schema:**
  ```typescript
  export const BrandGuardianOutputSchema = z.object({
    passed: z.boolean(),
    readabilityGrade: z.number(), // Flesch-Kincaid score
    characterCount: z.number(),
    characterLimit: z.number(),
    violations: z.array(z.string()),
    suggestions: z.array(z.string()),
    polishedText: z.string().optional()
  });
  ```

### 3.2 `adBoosterTool` Specification
- **Zod Input Schema:**
  ```typescript
  export const AdBoosterInputSchema = z.object({
    productName: z.string(),
    targetAudience: z.string(),
    objective: z.enum(['LEAD_GENERATION', 'CONVERSIONS', 'BRAND_AWARENESS']),
    budgetDaily: z.number().positive(),
    platform: z.enum(['META', 'GOOGLE'])
  });
  ```
- **Zod Output Schema:**
  ```typescript
  export const AdBoosterOutputSchema = z.object({
    headlines: z.array(z.string()).length(5),
    primaryTexts: z.array(z.string()).length(3),
    callToAction: z.string(),
    estimatedCTR: z.string(),
    targetROAS: z.number()
  });
  ```

### 3.3 `growthScoreTool` Specification
- **Zod Input Schema:**
  ```typescript
  export const GrowthScoreInputSchema = z.object({
    businessId: z.string().uuid(),
    periodDays: z.number().default(30)
  });
  ```
- **Zod Output Schema:**
  ```typescript
  export const GrowthScoreOutputSchema = z.object({
    overallScore: z.number().min(0).max(100),
    postingConsistencyScore: z.number().min(0).max(100),
    engagementVelocityScore: z.number().min(0).max(100),
    audienceGrowthRate: z.string(),
    recommendations: z.array(z.string())
  });
  ```

---

## 4. 6 Multi-Step Workflow State Machines

### 4.1 Workflow Execution State Model
```
[DRAFT / INITIAL] ──> [STEP_1_EXECUTION] ──> [STEP_2_EXECUTION]
                             │                      │
                             ▼ (Failure)            ▼ (Success)
                     [WORKFLOW_FAILED]       [PENDING_APPROVAL]
                                                    │
                                    ┌───────────────┴───────────────┐
                                    ▼                               ▼
                           [APPROVED / QUEUED]             [REJECTED_BY_USER]
```

### 4.2 State Transition Validations (`WorkflowService`)
- `submitForReview(draftId)`: Validates that draft is in `GENERATED` state; transitions to `PENDING_REVIEW`. Throws error if already approved or scheduled.
- `approveDraft(draftId, userId)`: Validates that draft is strictly in `PENDING_REVIEW` state. Logs approver audit trail and schedules post in BullMQ.
- `rejectDraft(draftId, reason)`: Transitions status to `REJECTED` and records rejection rationale in activity log.

---

## 5. Mobile Companion App Specifications

### 5.1 Route Mapping & Feature Parity
| Mobile Route (`mobile-app/src/app/`) | Equivalent Web SaaS URL | Features & Functional Capability |
| :--- | :--- | :--- |
| `(auth)/login.tsx` | `/login` | Biometric Face ID / Fingerprint login + Google OAuth + Session sync |
| `(auth)/register.tsx` | `/register` | 6-digit cryptographic numeric OTP verification |
| `(tabs)/index.tsx` | `/dashboard` | Executive KPI cards, quota progress, live FlashList post queue |
| `(tabs)/composer.tsx` | `/composer` | Multi-platform copy editor, AI generation modal, image picker |
| `(tabs)/calendar.tsx` | `/schedule` | Weekly timeline view, slot peak indicators |
| `(tabs)/inbox.tsx` | `/inbox` | Omnichannel DM conversation list, instant AI suggested responses |
| `(tabs)/analytics.tsx` | `/analytics` | Follower growth chart, credit telemetry, export reports |
| `(user)/carousels/` | `/carousels` | Slide-by-slide swipeable card previewer |
| `(user)/voice/` | `/voice` | ElevenLabs neural voice generator with reactive audio waveforms |
| `(user)/image/` | `/image` | Diffusion image synthesizer with aspect ratio controls |
| `(user)/videos/` | `/videos` | Multi-scene RAG video director viewer |
| `(user)/settings/*` | `/settings/*` | Profile, Workspaces, Billing, Team, Social, API Keys |
