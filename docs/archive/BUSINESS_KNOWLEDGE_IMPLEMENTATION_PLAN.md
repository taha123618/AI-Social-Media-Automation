# Business Knowledge & Brand-Aligned Content Generation - Implementation Plan

## Overview
This document outlines the implementation of a comprehensive Business Knowledge module and Brand-Aligned Content Generation system for the AI Social Media Automation platform.

## Architecture

### 1. Database Schema Extensions

#### 1.1 Enhanced BusinessProfile Model
Current fields to extend:
- Add: `tagline`, `slogan`, `coreValues[]`, `uniqueValueProposition`
- Add: `products/services` details with descriptions
- Add: `businessModel` (B2B, B2C, Subscription, etc.)
- Add: `geographicMarkets[]`
- Add: `targetAudienceDetails` (JSON for detailed persona)

#### 1.2 New Models to Create

**BusinessProfileVersion** (Audit Trail)
- `id` (PK)
- `businessProfileId` (FK)
- `versionNumber`
- `changes` (JSON diff)
- `changedBy` (FK to User)
- `changedAt` (DateTime)
- `reason` (String)

**BusinessSummary**
- `id` (PK)
- `businessProfileId` (FK, unique)
- `shortSummary` (50-100 words)
- `detailedOverview` (150-300 words)
- `elevatorPitch` (1-2 sentences)
- `marketingPositioning` (String)
- `generatedAt` (DateTime)
- `generatedBy` (String - "AI" or userId)
- `isApproved` (Boolean)
- `approvedBy` (FK to User)
- `approvedAt` (DateTime)

**ContentGenerationContext**
- `id` (PK)
- `contentDraftId` (FK)
- `businessProfileSnapshot` (JSON - full profile state at generation time)
- `generationPrompt` (String)
- `generationParameters` (JSON - includes tone, length, platform, etc.)
- `modelUsed` (String - e.g., "gpt-4-turbo")
- `generatedAt` (DateTime)

**ContentUniquenessLog**
- `id` (PK)
- `businessId` (FK)
- `contentHash` (String - SHA256 of generated content)
- `contentDraftId` (FK)
- `generatedAt` (DateTime)
- `platform` (String)

**ContentScheduleRecurrence**
- `id` (PK)
- `businessId` (FK)
- `recurrenceType` (DAILY, WEEKLY, BI_WEEKLY, MONTHLY)
- `recurrencePattern` (JSON - detailed schedule config)
- `startDate` (DateTime)
- `endDate` (DateTime)
- `timezone` (String)
- `autoOptimize` (Boolean)
- `lastOptimizedAt` (DateTime)
- `createdAt` (DateTime)

### 2. Custom AI Agents & Tools (`services/ai/*`)

#### 2.1 Business Summary Generation Agent
**Purpose:** Automatically generate business summaries from profile data

**Tools:**
- `generateBusinessSummary` - AI-powered summary generation
- `validateBusinessProfile` - Check for missing critical fields
- `flagConflictingData` - Detect inconsistencies
- `storeBusinessSummary` - Save generated summaries

#### 2.2 Content Generation Agent
**Purpose:** Create brand-aligned, unique content based on intent and parameters

**Tools:**
- `generateContentByIntent` - Generate based on Sales/Educational/Event intent
- `checkContentUniqueness` - Verify against content history
- `personalizationLogic` - Adjust based on business type, audience, geography
- `validateBrandCompliance` - Ensure only offered services promoted
- `generateVisualPrompt` - Create DALL-E prompts for images/videos

#### 2.3 Scheduling Intelligence Agent
**Purpose:** Optimize posting schedules and handle recurring schedules

**Tools:**
- `optimizePostingTimes` - Calculate best times per platform
- `generateScheduleDistribution` - Spread content evenly across periods
- `validateTimezone` - Ensure valid timezone handling
- `calculateRecurringSchedules` - Generate dates for recurring patterns

### 3. API Endpoints

#### 3.1 Business Profile Management
```
POST   /api/business/profile/complete          - Complete profile data
PUT    /api/business/profile/:id               - Update profile
GET    /api/business/profile/:id               - Get current profile
GET    /api/business/profile/:id/versions      - Get version history
DELETE /api/business/profile/:id/version/:vid  - Rollback to version
POST   /api/business/profile/validate          - Validate profile completeness
GET    /api/business/profile/missing-fields    - Get missing required fields
```

#### 3.2 Business Summary Generation
```
POST   /api/business/summaries/generate        - Generate AI summaries
GET    /api/business/summaries/:id             - Get current summary
POST   /api/business/summaries/:id/approve     - Approve generated summary
PUT    /api/business/summaries/:id             - Manually edit summary
GET    /api/business/summaries/:id/history     - Get generation history
```

#### 3.3 Content Generation
```
POST   /api/content/generate                   - Generate content with parameters
GET    /api/content/generated/:id              - Get generated content
POST   /api/content/:id/regenerate             - Regenerate with new parameters
GET    /api/content/uniqueness-check/:id       - Check against duplicates
POST   /api/content/context                    - Store generation context
```

#### 3.4 Content Scheduling
```
POST   /api/schedule/recurring                 - Create recurring schedule
PUT    /api/schedule/recurring/:id             - Update recurring schedule
GET    /api/schedule/recurring/:id             - Get recurring schedule
DELETE /api/schedule/recurring/:id             - Delete recurring schedule
POST   /api/schedule/optimize                  - Optimize posting times
POST   /api/schedule/distribute                - Distribute content across period
GET    /api/schedule/recommended-times         - Get platform best practices
```

### 4. Content Generation Logic Flow

```
User Input
    ↓
[Content Type Selection]
    ├→ SALES: Highlight benefits, UVP, CTA, urgency
    ├→ EDUCATIONAL: Informative, authority positioning
    ├→ EVENT: Event details, brand relevance, participation
    └→ OTHER: Standard content generation
    ↓
[Personalization]
    ├→ Business type analysis
    ├→ Target audience matching
    ├→ Geography adjustment
    └→ Seasonal/event consideration
    ↓
[Brand Context Integration]
    ├→ Retrieve business profile
    ├→ Load tone/voice settings
    ├→ Fetch products/services
    └→ Check forbidden words
    ↓
[AI Content Generation]
    └→ GPT-4 with specific prompts
    ↓
[Uniqueness Validation]
    ├→ Compare against history
    ├→ Check content hash
    └→ Flag potential duplicates
    ↓
[Platform-Specific Adaptation]
    ├→ Length constraints
    ├→ Format requirements
    ├→ Hashtag optimization
    └→ Visual prompt generation
    ↓
[Output with Media]
    ├→ Text content (platform-specific versions)
    ├→ Image generation prompt (DALL-E)
    ├→ Video script (if applicable)
    └→ Metadata (CTAs, hashtags, etc.)
```

### 5. Scheduling Logic Flow

```
User Selection: Publish Date/Time + Recurring Config
    ↓
[Manual Scheduling Mode]
    └→ Store selected date/time/timezone
    ↓
[Auto-Scheduling Mode]
    ├→ Analyze posting frequency preference (posts/week)
    ├→ Get platform best practices
    ├→ Fetch audience engagement data (if available)
    ├→ Calculate optimal posting times
    ├→ Distribute content evenly across period
    ├→ Avoid simultaneous posting conflicts
    └→ Store optimized schedule
    ↓
[Recurring Schedule Generation]
    ├→ Convert recurrence pattern to date list
    │   ├→ DAILY: Every day at specified time
    │   ├→ WEEKLY: Same day/time each week
    │   ├→ BI-WEEKLY: Every 2 weeks
    │   └→ MONTHLY: Same date each month (with edge case handling)
    ├→ Apply timezone normalization
    └→ Store schedule instances
```

### 6. Key Features Implementation

#### 6.1 Data Validation & Quality Control
- Required fields: name, tagline, mission, UVP, target audience, products/services
- Validation on profile update
- Auto-flag missing fields
- Detect conflicting information (e.g., B2C services for B2B business)
- Manual override capability

#### 6.2 Uniqueness & Originality
- SHA256 hash of generated content
- Compare against all previous content for same business
- Varied phrasing algorithms
- Template detection and prevention
- Optional: Similarity scoring with threshold

#### 6.3 Brand Compliance
- Check promoted services exist in profile
- Validate no forbidden words in output
- Ensure tone matches brand settings
- Validate no exaggerated claims
- Industry-specific compliance rules

#### 6.4 AI Constraints
- Only generate content for available services
- Use actual business data only
- Prevent generic filler content
- Maintain brand accuracy

## Implementation Phases

### Phase 1: Database Schema (Week 1)
- [ ] Extend BusinessProfile model
- [ ] Create BusinessSummary model
- [ ] Create BusinessProfileVersion model
- [ ] Create ContentGenerationContext model
- [ ] Create ContentUniquenessLog model
- [ ] Create ContentScheduleRecurrence model
- [ ] Run migrations

### Phase 2: Custom AI Agents & Tools (Week 2)
- [ ] Implement tools in `services/ai/tools/`
- [ ] Add to `services/ai/index.ts`sSummary generation tool
- [ ] Build ContentGeneration tool with intent logic
- [ ] Build SchedulingIntelligence tool
- [ ] Create and register agents
- [ ] Add to services/ai/index.ts

### Phase 3: API Routes (Week 2-3)
- [ ] Business profile endpoints
- [ ] Business summary endpoints
- [ ] Content generation endpoints
- [ ] Scheduling endpoints
- [ ] Add middleware for auth/validation

### Phase 4: Frontend Integration (Week 3-4)
- [ ] Create UI components for profile setup
- [ ] Summary generation & approval UI
- [ ] Content generation form with parameters
- [ ] Scheduling UI (manual + auto modes)
- [ ] Uniqueness warning display

### Phase 5: Integration & Testing (Week 4)
- [ ] Integration tests
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation

## Enums to Create/Update

```typescript
enum BusinessModel {
  B2B
  B2C
  B2B2C
  SUBSCRIPTION
  MARKETPLACE
  FREEMIUM
  HYBRID
}

enum ContentGenerationIntent {
  SALES              // Already exists
  EDUCATION          // Already exists
  EVENT              // Already exists
  ENGAGEMENT
  BRAND_AWARENESS
}

enum TonePreference {
  PROFESSIONAL
  LUXURY
  FRIENDLY
  INFORMATIVE
  PERSUASIVE
  CASUAL
  INSPIRATIONAL
  COMEDIC
  MOTIVATIONAL
  URGENT
}

enum ContentLength {
  SHORT              // 50-100 words
  MEDIUM             // 150-300 words
  LONG_FORM          // 500+ words
}

enum RecurrenceType {
  DAILY
  WEEKLY
  BI_WEEKLY
  MONTHLY
}

enum SchedulingMode {
  MANUAL
  AUTO_OPTIMIZE
}
```

## Success Metrics

1. **Profile Completeness:** 90%+ of businesses complete full profile
2. **Summary Quality:** 85%+ approval rate on AI-generated summaries
3. **Content Uniqueness:** 95%+ of generated content passes uniqueness check
4. **Generation Speed:** <30s average generation time
5. **Scheduling Accuracy:** 99%+ of scheduled posts publish at correct time
6. **Brand Compliance:** 100% of generated content complies with brand settings

## Dependencies

- Existing custom AI infrastructure (`services/ai/*`)
- Existing authentication system
- Existing Prisma schema
- OpenAI API (GPT-4 Turbo, DALL-E 3)
- Storage backend (S3 for generated assets)

## Risk Mitigation

1. **Generic Content:** Implement strict brand context integration
2. **Duplicates:** Use content hashing and semantic similarity
3. **Compliance:** Pre-generation validation and manual overrides
4. **Performance:** Cache frequently accessed profiles and summaries
5. **Data Loss:** Version control on all profile changes
