-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";


-- CreateEnum
CREATE TYPE "public"."AdPlatform" AS ENUM ('META', 'GOOGLE', 'LINKEDIN', 'TIKTOK', 'X');

-- CreateEnum
CREATE TYPE "public"."AdStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('super_admin', 'admin');

-- CreateEnum
CREATE TYPE "public"."AssetStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."BlogArticleStatus" AS ENUM ('DRAFT', 'GENERATING', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."BlogGenAction" AS ENUM ('GENERATE_OUTLINE', 'GENERATE_ARTICLE', 'GENERATE_TITLE', 'GENERATE_META', 'GENERATE_FAQ', 'GENERATE_CTA', 'EXPAND_SECTION', 'REWRITE_SECTION', 'HUMANIZE', 'SUMMARIZE', 'SEO_OPTIMIZE');

-- CreateEnum
CREATE TYPE "public"."BlogGenStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."BlogTone" AS ENUM ('PROFESSIONAL', 'CONVERSATIONAL', 'ACADEMIC', 'CASUAL', 'PERSUASIVE', 'STORYTELLING', 'HUMOROUS', 'AUTHORITATIVE', 'INSPIRATIONAL', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "public"."BrandTone" AS ENUM ('PROFESSIONAL', 'FRIENDLY', 'CREATIVE', 'TECHNICAL', 'LUXURY', 'CASUAL');

-- CreateEnum
CREATE TYPE "public"."BusinessModel" AS ENUM ('B2B', 'B2C', 'B2B2C', 'SUBSCRIPTION', 'MARKETPLACE', 'FREEMIUM', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."BusinessType" AS ENUM ('RESTAURANT', 'SALON', 'CONTRACTOR', 'AUTO_REPAIR', 'REAL_ESTATE', 'HEALTH_FITNESS', 'MEDICAL_DENTAL', 'LEGAL_FINANCIAL', 'RETAIL', 'HOME_SERVICES', 'BEAUTY_COSMETICS', 'EDUCATION', 'PET_SERVICES', 'PHOTOGRAPHY', 'EVENT_SERVICES', 'PERSONAL_SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CampaignObjective" AS ENUM ('TRAFFIC', 'LEADS', 'SALES', 'AWARENESS');

-- CreateEnum
CREATE TYPE "public"."ContentIntent" AS ENUM ('SALES', 'EDUCATION', 'EVENT', 'ENGAGEMENT', 'BRAND_AWARENESS');

-- CreateEnum
CREATE TYPE "public"."ContentLength" AS ENUM ('SHORT', 'MEDIUM', 'LONG_FORM');

-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('GENERATED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED', 'POSTED', 'FAILED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "public"."DemoLeadSource" AS ENUM ('MARKETING_PAGE', 'DIRECT_LINK', 'REFERRAL', 'AD_CAMPAIGN', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DemoLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'SCHEDULED', 'COMPLETED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "public"."EntityType" AS ENUM ('CONTENT_DRAFT', 'DRAFT_COMMENT', 'BUSINESS', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "public"."FeatureType" AS ENUM ('AI_POSTS', 'VIDEO_GENERATIONS', 'TEAM_MEMBERS', 'STORAGE_GB', 'API_CALLS', 'AI_BLOG_ARTICLES', 'AD_GENERATIONS', 'CAMPAIGN_LAUNCHES');

-- CreateEnum
CREATE TYPE "public"."ImageStorageStatus" AS ENUM ('UPLOADED', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'SYNCED');

-- CreateEnum
CREATE TYPE "public"."LeadType" AS ENUM ('PHONE_CALL', 'MESSAGE', 'WEBSITE_VISIT', 'BOOKING', 'DIRECTIONS', 'FORM_SUBMISSION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MeetingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('DRAFT_ASSIGNED', 'DRAFT_APPROVED', 'DRAFT_REJECTED', 'COMMENT_MENTION', 'COMMENT_REPLY', 'SUBSCRIPTION_EXPIRING', 'USAGE_LIMIT_WARNING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."OptimizationAction" AS ENUM ('PAUSE_AD', 'INCREASE_BUDGET', 'DECREASE_BUDGET', 'DUPLICATE_WINNER', 'GENERATE_NEW_VARIANTS');

-- CreateEnum
CREATE TYPE "public"."OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'MASTODON', 'BLUESKY', 'PINTEREST', 'GOOGLE_BUSINESS', 'GOHIGHLEVEL', 'HUBSPOT', 'SALESFORCE');

-- CreateEnum
CREATE TYPE "public"."RecurrenceType" AS ENUM ('DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."ReviewRequestChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "public"."ReviewRequestStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'SUBMITTED', 'BOUNCED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "public"."ReviewSource" AS ENUM ('GOOGLE', 'YELP', 'FACEBOOK', 'TRIPADVISOR', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SchedulingMode" AS ENUM ('MANUAL', 'AUTO_OPTIMIZE');

-- CreateEnum
CREATE TYPE "public"."Sentiment" AS ENUM ('VERY_POSITIVE', 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'VERY_NEGATIVE');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "public"."TonePreference" AS ENUM ('PROFESSIONAL', 'LUXURY', 'FRIENDLY', 'INFORMATIVE', 'PERSUASIVE', 'CASUAL', 'INSPIRATIONAL', 'COMEDIC', 'MOTIVATIONAL', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."UploadCategory" AS ENUM ('JOB_PHOTO', 'BEFORE_AFTER', 'PRODUCT');

-- CreateEnum
CREATE TYPE "public"."UsagePeriod" AS ENUM ('MONTHLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."VideoJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."VideoProvider" AS ENUM ('RUNWAY', 'LUMA');

-- CreateEnum
CREATE TYPE "public"."WorkflowExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."WorkflowRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "userId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ad" (
    "id" TEXT NOT NULL,
    "adSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."AdStatus" NOT NULL DEFAULT 'DRAFT',
    "creative" JSONB,
    "platformId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdAccount" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" "public"."AdPlatform" NOT NULL,
    "name" TEXT NOT NULL,
    "platformAccountId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB,
    "pageId" TEXT,
    "balance" DOUBLE PRECISION,
    "currency" TEXT,
    "timezone" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdAnalytics" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "campaignId" TEXT,
    "adSetId" TEXT,
    "adId" TEXT,
    "platform" "public"."AdPlatform" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdSet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."AdStatus" NOT NULL DEFAULT 'DRAFT',
    "audience" JSONB,
    "dailyBudget" DOUBLE PRECISION,
    "platformId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdVariant" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "headline" TEXT,
    "primaryText" TEXT,
    "description" TEXT,
    "cta" TEXT,
    "performance" JSONB,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "AdVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApprovalLog" (
    "id" TEXT NOT NULL,
    "status" "public"."ContentStatus" NOT NULL,
    "comment" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,

    CONSTRAINT "ApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogArticle" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "businessId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "content" TEXT,
    "contentMarkdown" TEXT,
    "contentJson" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "excerpt" TEXT,
    "featuredImageUrl" TEXT,
    "status" "public"."BlogArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "targetKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secondaryKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tone" "public"."BlogTone" NOT NULL DEFAULT 'PROFESSIONAL',
    "language" TEXT NOT NULL DEFAULT 'en',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 0,
    "seoScore" INTEGER,
    "readabilityScore" DOUBLE PRECISION,
    "aiModel" TEXT,
    "generationPrompt" TEXT,
    "outline" JSONB,
    "faqItems" JSONB,
    "ctaContent" JSONB,
    "internalLinks" JSONB,
    "tokenUsage" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogArticleVersion" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "contentJson" JSONB,
    "changedBy" TEXT NOT NULL,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogArticleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogGenerationLog" (
    "id" TEXT NOT NULL,
    "articleId" TEXT,
    "businessId" TEXT NOT NULL,
    "action" "public"."BlogGenAction" NOT NULL,
    "inputPrompt" TEXT NOT NULL,
    "outputPreview" TEXT,
    "model" TEXT NOT NULL,
    "tokenUsage" JSONB,
    "durationMs" INTEGER,
    "status" "public"."BlogGenStatus" NOT NULL DEFAULT 'COMPLETED',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "businessId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogSEOReport" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "titleScore" INTEGER NOT NULL,
    "metaDescriptionScore" INTEGER NOT NULL,
    "headingStructureScore" INTEGER NOT NULL,
    "keywordDensityScore" INTEGER NOT NULL,
    "readabilityScore" INTEGER NOT NULL,
    "contentLengthScore" INTEGER NOT NULL,
    "internalLinkScore" INTEGER NOT NULL,
    "imageOptScore" INTEGER NOT NULL,
    "issues" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "serpPreview" JSONB,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogSEOReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogSavedPrompt" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "category" TEXT,
    "businessId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogSavedPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "structure" JSONB NOT NULL,
    "systemPrompt" TEXT,
    "projectId" TEXT,
    "businessId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BrandProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "writingStyle" TEXT,
    "tone" "public"."TonePreference",
    "vocabulary" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ctaStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessType" "public"."BusinessType",
    "googleBusinessProfileId" TEXT,
    "location" JSONB,
    "operatingHours" JSONB,
    "organizationId" TEXT,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "websiteScrapedAt" TIMESTAMP(3),
    "preferences" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessMember" (
    "id" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessProfile" (
    "id" TEXT NOT NULL,
    "mission" TEXT,
    "vision" TEXT,
    "uvp" TEXT,
    "targetAudience" TEXT,
    "tone" TEXT,
    "industry" TEXT,
    "forbiddenWords" TEXT[],
    "businessId" TEXT NOT NULL,
    "autoRequestReviews" BOOLEAN NOT NULL DEFAULT false,
    "brandTone" "public"."BrandTone",
    "colorPalette" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usp" TEXT,
    "watermark" TEXT,
    "businessModel" "public"."BusinessModel",
    "competitiveAdvantages" TEXT[],
    "coreValues" TEXT[],
    "geographicMarkets" TEXT[],
    "keyBenefits" TEXT[],
    "productsServices" JSONB,
    "slogan" TEXT,
    "tagline" TEXT,
    "targetAudienceDetails" JSONB,
    "tonePreferences" "public"."TonePreference"[],
    "uniqueValueProposition" TEXT,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessProfileVersion" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changes" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "BusinessProfileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessSummary" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "shortSummary" TEXT NOT NULL,
    "detailedOverview" TEXT NOT NULL,
    "elevatorPitch" TEXT NOT NULL,
    "marketingPositioning" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" "public"."CampaignObjective" NOT NULL,
    "platform" "public"."AdPlatform" NOT NULL,
    "status" "public"."AdStatus" NOT NULL DEFAULT 'DRAFT',
    "dailyBudget" DOUBLE PRECISION,
    "lifetimeBudget" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "platformId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CampaignLaunch" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "launchedByUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "platformCampaignId" TEXT,
    "platformDetails" JSONB,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignLaunch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentAIHistory" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "tone" TEXT,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentAIHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "intent" "public"."ContentIntent" NOT NULL,
    "platforms" "public"."Platform"[],
    "customPrompt" TEXT,
    "contextUsed" JSONB,
    "mediaUrl" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assetStatus" "public"."AssetStatus" NOT NULL DEFAULT 'PENDING',
    "contentJson" JSONB,
    "videoScript" JSONB,
    "visualPrompt" TEXT,
    "executionId" TEXT,
    "workflowId" TEXT,
    "content" TEXT,

    CONSTRAINT "ContentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentGenerationContext" (
    "id" TEXT NOT NULL,
    "contentDraftId" TEXT NOT NULL,
    "businessProfileSnapshot" JSONB NOT NULL,
    "businessId" TEXT NOT NULL,
    "generationPrompt" TEXT NOT NULL,
    "generationParameters" JSONB NOT NULL,
    "modelUsed" TEXT NOT NULL DEFAULT 'openai/gpt-4-turbo',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentGenerationContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentRecommendation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "postId" TEXT,
    "recommendations" JSONB NOT NULL,
    "basedOnMetrics" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentScheduleRecurrence" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "recurrenceType" "public"."RecurrenceType" NOT NULL,
    "recurrencePattern" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "autoOptimize" BOOLEAN NOT NULL DEFAULT false,
    "lastOptimizedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentScheduleRecurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentUniquenessLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "contentDraftId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT,
    "contentPreview" TEXT NOT NULL,

    CONSTRAINT "ContentUniquenessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DraftComment" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DraftComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ErrorLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "source" TEXT NOT NULL,
    "context" JSONB,
    "path" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImageStorage" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "userId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" BYTEA,
    "errorMessage" TEXT,
    "status" "public"."ImageStorageStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ImageStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT,
    "userId" TEXT,

    CONSTRAINT "JobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBase" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector NOT NULL,
    "metadata" JSONB,
    "documentId" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "s3Key" TEXT,
    "sourceUrl" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledgeBaseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "postId" TEXT,
    "leadType" "public"."LeadType" NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SOCIAL_MEDIA',
    "status" "public"."LeadStatus" NOT NULL DEFAULT 'NEW',
    "estimatedValue" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "actualValue" DOUBLE PRECISION,
    "notes" TEXT,
    "contactedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ManualOverride" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalContent" TEXT NOT NULL,
    "modifiedContent" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "entityId" TEXT,
    "entityType" "public"."EntityType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OAuthState" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "tokenData" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptimizationRule" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "action" "public"."OptimizationAction" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptimizationSuggestion" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "expectedImpact" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitedBy" TEXT,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformCredential" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "adAccountId" TEXT,
    "platform" "public"."AdPlatform" NOT NULL,
    "providerUserId" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expiresAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "externalPostId" TEXT,
    "platform" "public"."Platform" NOT NULL,
    "postedAt" TIMESTAMP(3),
    "publishedUrl" TEXT,
    "socialAccountId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "executionId" TEXT,
    "workflowId" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "analyticsUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingClicks" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "directionRequests" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "messageClicks" INTEGER NOT NULL DEFAULT 0,
    "phoneClicks" INTEGER NOT NULL DEFAULT 0,
    "profileVisits" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "reelWatchTime" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "storyExits" INTEGER NOT NULL DEFAULT 0,
    "storyTaps" INTEGER NOT NULL DEFAULT 0,
    "videoCompletionRate" DOUBLE PRECISION,
    "videoViews" INTEGER NOT NULL DEFAULT 0,
    "websiteClicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "source" "public"."ReviewSource" NOT NULL,
    "externalId" TEXT,
    "reviewerName" TEXT NOT NULL,
    "reviewerEmail" TEXT,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "responseText" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "platformUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" "public"."Sentiment" NOT NULL DEFAULT 'NEUTRAL',
    "convertedToPost" BOOLEAN NOT NULL DEFAULT false,
    "socialPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReviewRequest" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "status" "public"."ReviewRequestStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "channel" "public"."ReviewRequestChannel" NOT NULL,
    "messageId" TEXT,
    "followUpCount" INTEGER NOT NULL DEFAULT 0,
    "lastFollowUpAt" TIMESTAMP(3),
    "reviewId" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialAccount" (
    "id" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "platformId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "name" TEXT,
    "avatar" TEXT,
    "businessId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "profileUrl" TEXT,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionUsage" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "feature" "public"."FeatureType" NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,
    "period" "public"."UsagePeriod" NOT NULL,
    "resetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SuccessfulPattern" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "patterns" JSONB NOT NULL,
    "engagementMetrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuccessfulPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "tags" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'VIEWER',
    "token" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ThirdPartyService" (
    "id" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "apiTier" TEXT DEFAULT 'free',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdPartyService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoGenerationJob" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "provider" "public"."VideoProvider" NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "public"."VideoJobStatus" NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "userId" TEXT,
    "executionId" TEXT,
    "workflowId" TEXT,

    CONSTRAINT "VideoGenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowExecution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "public"."WorkflowExecutionStatus" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "result" JSONB,
    "triggerData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "public"."WorkflowRunStatus" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowStep" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'credentials',
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "providerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."AdminRole" NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "permissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."demo_bookings" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "meetingLink" TEXT,
    "meetingStatus" "public"."MeetingStatus" NOT NULL DEFAULT 'PENDING',
    "calendarProvider" TEXT,
    "calendarEventId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."demo_leads" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "teamSize" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "useCase" TEXT NOT NULL,
    "preferredDate" TEXT NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "notes" TEXT,
    "status" "public"."DemoLeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "public"."DemoLeadSource" NOT NULL DEFAULT 'MARKETING_PAGE',
    "assignedTo" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."image_generation_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,
    "aspectRatio" TEXT,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "model" TEXT,
    "quality" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "style" TEXT,
    "variations" INTEGER,
    "brandId" TEXT,
    "colors" TEXT[],
    "imageType" TEXT,
    "referenceImage" TEXT,
    "providerJobId" TEXT,
    "executionId" TEXT,
    "workflowId" TEXT,

    CONSTRAINT "image_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL DEFAULT 'We are currently undergoing scheduled maintenance. Please check back soon.',
    "estimatedCompletion" TIMESTAMP(3),
    "allowlistIps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowlistEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "apiBlocked" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "maintenance_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posting_schedule_slots" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posting_schedule_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posting_schedules" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posting_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmails" TEXT[],
    "autoAssignLead" BOOLEAN NOT NULL DEFAULT true,
    "confirmationTemplate" JSONB,
    "adminTemplate" JSONB,
    "thankYouPage" TEXT NOT NULL DEFAULT '/thank-you',
    "meetingDuration" INTEGER NOT NULL DEFAULT 30,
    "dateRangeDays" INTEGER NOT NULL DEFAULT 90,
    "crmProvider" TEXT,
    "calendarProvider" TEXT,
    "slackWebhook" TEXT,
    "discordWebhook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "token" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "secret" TEXT,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_upload_configs" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "uploadCategory" "public"."UploadCategory" NOT NULL,
    "autoCaption" BOOLEAN NOT NULL DEFAULT true,
    "autoSchedule" BOOLEAN NOT NULL DEFAULT false,
    "scheduleOffsetMinutes" INTEGER NOT NULL DEFAULT 60,
    "platform" TEXT NOT NULL DEFAULT 'INSTAGRAM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_upload_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "public"."ActivityLog"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "ActivityLog_entity_idx" ON "public"."ActivityLog"("entity" ASC);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "public"."ActivityLog"("userId" ASC);

-- CreateIndex
CREATE INDEX "Ad_adSetId_idx" ON "public"."Ad"("adSetId" ASC);

-- CreateIndex
CREATE INDEX "AdAccount_businessId_idx" ON "public"."AdAccount"("businessId" ASC);

-- CreateIndex
CREATE INDEX "AdAccount_platform_idx" ON "public"."AdAccount"("platform" ASC);

-- CreateIndex
CREATE INDEX "AdAnalytics_adId_idx" ON "public"."AdAnalytics"("adId" ASC);

-- CreateIndex
CREATE INDEX "AdAnalytics_adSetId_idx" ON "public"."AdAnalytics"("adSetId" ASC);

-- CreateIndex
CREATE INDEX "AdAnalytics_businessId_date_idx" ON "public"."AdAnalytics"("businessId" ASC, "date" ASC);

-- CreateIndex
CREATE INDEX "AdAnalytics_campaignId_idx" ON "public"."AdAnalytics"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "AdSet_campaignId_idx" ON "public"."AdSet"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "AdVariant_adId_idx" ON "public"."AdVariant"("adId" ASC);

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action" ASC);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId" ASC);

-- CreateIndex
CREATE INDEX "BlogArticle_businessId_status_idx" ON "public"."BlogArticle"("businessId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "BlogArticle_createdAt_idx" ON "public"."BlogArticle"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "BlogArticle_creatorId_idx" ON "public"."BlogArticle"("creatorId" ASC);

-- CreateIndex
CREATE INDEX "BlogArticle_projectId_idx" ON "public"."BlogArticle"("projectId" ASC);

-- CreateIndex
CREATE INDEX "BlogArticleVersion_articleId_idx" ON "public"."BlogArticleVersion"("articleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BlogArticleVersion_articleId_versionNumber_key" ON "public"."BlogArticleVersion"("articleId" ASC, "versionNumber" ASC);

-- CreateIndex
CREATE INDEX "BlogGenerationLog_action_idx" ON "public"."BlogGenerationLog"("action" ASC);

-- CreateIndex
CREATE INDEX "BlogGenerationLog_articleId_idx" ON "public"."BlogGenerationLog"("articleId" ASC);

-- CreateIndex
CREATE INDEX "BlogGenerationLog_businessId_createdAt_idx" ON "public"."BlogGenerationLog"("businessId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "BlogProject_businessId_idx" ON "public"."BlogProject"("businessId" ASC);

-- CreateIndex
CREATE INDEX "BlogProject_creatorId_idx" ON "public"."BlogProject"("creatorId" ASC);

-- CreateIndex
CREATE INDEX "BlogSEOReport_analyzedAt_idx" ON "public"."BlogSEOReport"("analyzedAt" ASC);

-- CreateIndex
CREATE INDEX "BlogSEOReport_articleId_idx" ON "public"."BlogSEOReport"("articleId" ASC);

-- CreateIndex
CREATE INDEX "BlogSavedPrompt_businessId_idx" ON "public"."BlogSavedPrompt"("businessId" ASC);

-- CreateIndex
CREATE INDEX "BlogSavedPrompt_creatorId_idx" ON "public"."BlogSavedPrompt"("creatorId" ASC);

-- CreateIndex
CREATE INDEX "BlogTemplate_businessId_idx" ON "public"."BlogTemplate"("businessId" ASC);

-- CreateIndex
CREATE INDEX "BlogTemplate_category_idx" ON "public"."BlogTemplate"("category" ASC);

-- CreateIndex
CREATE INDEX "BrandProfile_businessId_idx" ON "public"."BrandProfile"("businessId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "public"."Business"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_userId_businessId_key" ON "public"."BusinessMember"("userId" ASC, "businessId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_businessId_key" ON "public"."BusinessProfile"("businessId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfileVersion_businessProfileId_versionNumber_key" ON "public"."BusinessProfileVersion"("businessProfileId" ASC, "versionNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSummary_businessProfileId_key" ON "public"."BusinessSummary"("businessProfileId" ASC);

-- CreateIndex
CREATE INDEX "Campaign_businessId_idx" ON "public"."Campaign"("businessId" ASC);

-- CreateIndex
CREATE INDEX "Campaign_platform_idx" ON "public"."Campaign"("platform" ASC);

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "public"."Campaign"("status" ASC);

-- CreateIndex
CREATE INDEX "CampaignLaunch_businessId_idx" ON "public"."CampaignLaunch"("businessId" ASC);

-- CreateIndex
CREATE INDEX "CampaignLaunch_campaignId_idx" ON "public"."CampaignLaunch"("campaignId" ASC);

-- CreateIndex
CREATE INDEX "CampaignLaunch_status_idx" ON "public"."CampaignLaunch"("status" ASC);

-- CreateIndex
CREATE INDEX "CommentAIHistory_businessId_createdAt_idx" ON "public"."CommentAIHistory"("businessId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "CommentAIHistory_userId_idx" ON "public"."CommentAIHistory"("userId" ASC);

-- CreateIndex
CREATE INDEX "ContentGenerationContext_businessId_idx" ON "public"."ContentGenerationContext"("businessId" ASC);

-- CreateIndex
CREATE INDEX "ContentGenerationContext_contentDraftId_idx" ON "public"."ContentGenerationContext"("contentDraftId" ASC);

-- CreateIndex
CREATE INDEX "ContentRecommendation_businessId_idx" ON "public"."ContentRecommendation"("businessId" ASC);

-- CreateIndex
CREATE INDEX "ContentRecommendation_postId_idx" ON "public"."ContentRecommendation"("postId" ASC);

-- CreateIndex
CREATE INDEX "ContentRecommendation_status_idx" ON "public"."ContentRecommendation"("status" ASC);

-- CreateIndex
CREATE INDEX "ContentScheduleRecurrence_businessId_idx" ON "public"."ContentScheduleRecurrence"("businessId" ASC);

-- CreateIndex
CREATE INDEX "ContentScheduleRecurrence_startDate_idx" ON "public"."ContentScheduleRecurrence"("startDate" ASC);

-- CreateIndex
CREATE INDEX "ContentUniquenessLog_businessId_idx" ON "public"."ContentUniquenessLog"("businessId" ASC);

-- CreateIndex
CREATE INDEX "ContentUniquenessLog_contentDraftId_idx" ON "public"."ContentUniquenessLog"("contentDraftId" ASC);

-- CreateIndex
CREATE INDEX "ContentUniquenessLog_contentHash_idx" ON "public"."ContentUniquenessLog"("contentHash" ASC);

-- CreateIndex
CREATE INDEX "DraftComment_authorId_idx" ON "public"."DraftComment"("authorId" ASC);

-- CreateIndex
CREATE INDEX "DraftComment_draftId_createdAt_idx" ON "public"."DraftComment"("draftId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "public"."ErrorLog"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "ErrorLog_resolved_idx" ON "public"."ErrorLog"("resolved" ASC);

-- CreateIndex
CREATE INDEX "ErrorLog_source_idx" ON "public"."ErrorLog"("source" ASC);

-- CreateIndex
CREATE INDEX "ImageStorage_businessId_idx" ON "public"."ImageStorage"("businessId" ASC);

-- CreateIndex
CREATE INDEX "ImageStorage_createdAt_idx" ON "public"."ImageStorage"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "ImageStorage_isPublic_idx" ON "public"."ImageStorage"("isPublic" ASC);

-- CreateIndex
CREATE INDEX "ImageStorage_mimeType_idx" ON "public"."ImageStorage"("mimeType" ASC);

-- CreateIndex
CREATE INDEX "ImageStorage_userId_idx" ON "public"."ImageStorage"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBase_businessId_key" ON "public"."KnowledgeBase"("businessId" ASC);

-- CreateIndex
CREATE INDEX "Lead_businessId_idx" ON "public"."Lead"("businessId" ASC);

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "public"."Lead"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Lead_leadType_idx" ON "public"."Lead"("leadType" ASC);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "public"."Lead"("status" ASC);

-- CreateIndex
CREATE INDEX "ManualOverride_draftId_idx" ON "public"."ManualOverride"("draftId" ASC);

-- CreateIndex
CREATE INDEX "ManualOverride_userId_createdAt_idx" ON "public"."ManualOverride"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "public"."Notification"("userId" ASC, "read" ASC);

-- CreateIndex
CREATE INDEX "OAuthState_businessId_idx" ON "public"."OAuthState"("businessId" ASC);

-- CreateIndex
CREATE INDEX "OptimizationRule_businessId_idx" ON "public"."OptimizationRule"("businessId" ASC);

-- CreateIndex
CREATE INDEX "OptimizationSuggestion_businessId_idx" ON "public"."OptimizationSuggestion"("businessId" ASC);

-- CreateIndex
CREATE INDEX "OptimizationSuggestion_status_idx" ON "public"."OptimizationSuggestion"("status" ASC);

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "public"."Organization"("ownerId" ASC);

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "public"."Organization"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "public"."Organization"("slug" ASC);

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_role_idx" ON "public"."OrganizationMember"("organizationId" ASC, "role" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "public"."OrganizationMember"("userId" ASC, "organizationId" ASC);

-- CreateIndex
CREATE INDEX "PlatformCredential_adAccountId_idx" ON "public"."PlatformCredential"("adAccountId" ASC);

-- CreateIndex
CREATE INDEX "PlatformCredential_businessId_idx" ON "public"."PlatformCredential"("businessId" ASC);

-- CreateIndex
CREATE INDEX "PlatformCredential_platform_idx" ON "public"."PlatformCredential"("platform" ASC);

-- CreateIndex
CREATE INDEX "Post_businessId_postedAt_idx" ON "public"."Post"("businessId" ASC, "postedAt" ASC);

-- CreateIndex
CREATE INDEX "Post_businessId_scheduledFor_idx" ON "public"."Post"("businessId" ASC, "scheduledFor" ASC);

-- CreateIndex
CREATE INDEX "Post_scheduledFor_idx" ON "public"."Post"("scheduledFor" ASC);

-- CreateIndex
CREATE INDEX "Review_businessId_idx" ON "public"."Review"("businessId" ASC);

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "public"."Review"("rating" ASC);

-- CreateIndex
CREATE INDEX "Review_sentiment_idx" ON "public"."Review"("sentiment" ASC);

-- CreateIndex
CREATE INDEX "Review_source_idx" ON "public"."Review"("source" ASC);

-- CreateIndex
CREATE INDEX "ReviewRequest_businessId_idx" ON "public"."ReviewRequest"("businessId" ASC);

-- CreateIndex
CREATE INDEX "ReviewRequest_channel_idx" ON "public"."ReviewRequest"("channel" ASC);

-- CreateIndex
CREATE INDEX "ReviewRequest_status_idx" ON "public"."ReviewRequest"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequest_token_key" ON "public"."ReviewRequest"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_businessId_platform_platformId_key" ON "public"."SocialAccount"("businessId" ASC, "platform" ASC, "platformId" ASC);

-- CreateIndex
CREATE INDEX "Subscription_organizationId_idx" ON "public"."Subscription"("organizationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "public"."Subscription"("organizationId" ASC);

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "public"."Subscription"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionUsage_subscriptionId_feature_period_key" ON "public"."SubscriptionUsage"("subscriptionId" ASC, "feature" ASC, "period" ASC);

-- CreateIndex
CREATE INDEX "SuccessfulPattern_businessId_createdAt_idx" ON "public"."SuccessfulPattern"("businessId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "SystemMetric_name_timestamp_idx" ON "public"."SystemMetric"("name" ASC, "timestamp" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_businessId_email_key" ON "public"."TeamInvitation"("businessId" ASC, "email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_token_key" ON "public"."TeamInvitation"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ThirdPartyService_businessId_platform_key" ON "public"."ThirdPartyService"("businessId" ASC, "platform" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "public"."User"("resetToken" ASC);

-- CreateIndex
CREATE INDEX "VideoGenerationJob_businessId_status_idx" ON "public"."VideoGenerationJob"("businessId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "VideoGenerationJob_createdAt_idx" ON "public"."VideoGenerationJob"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "WorkflowRun_executionId_idx" ON "public"."WorkflowRun"("executionId" ASC);

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowId_idx" ON "public"."WorkflowRun"("workflowId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "public"."accounts"("providerId" ASC, "accountId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "public"."api_keys"("key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "demo_bookings_leadId_key" ON "public"."demo_bookings"("leadId" ASC);

-- CreateIndex
CREATE INDEX "demo_leads_assignedTo_idx" ON "public"."demo_leads"("assignedTo" ASC);

-- CreateIndex
CREATE INDEX "demo_leads_createdAt_idx" ON "public"."demo_leads"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "demo_leads_email_idx" ON "public"."demo_leads"("email" ASC);

-- CreateIndex
CREATE INDEX "demo_leads_status_idx" ON "public"."demo_leads"("status" ASC);

-- CreateIndex
CREATE INDEX "image_generation_jobs_businessId_status_idx" ON "public"."image_generation_jobs"("businessId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "image_generation_jobs_createdAt_idx" ON "public"."image_generation_jobs"("createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "image_generation_jobs_providerJobId_key" ON "public"."image_generation_jobs"("providerJobId" ASC);

-- CreateIndex
CREATE INDEX "image_generation_jobs_userId_idx" ON "public"."image_generation_jobs"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "posting_schedule_slots_scheduleId_dayOfWeek_hour_minute_key" ON "public"."posting_schedule_slots"("scheduleId" ASC, "dayOfWeek" ASC, "hour" ASC, "minute" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "posting_schedules_businessId_key" ON "public"."posting_schedules"("businessId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "verifications_identifier_value_key" ON "public"."verifications"("identifier" ASC, "value" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_upload_configs_workflowId_key" ON "public"."workflow_upload_configs"("workflowId" ASC);

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ad" ADD CONSTRAINT "Ad_adSetId_fkey" FOREIGN KEY ("adSetId") REFERENCES "public"."AdSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdAccount" ADD CONSTRAINT "AdAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdAnalytics" ADD CONSTRAINT "AdAnalytics_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdAnalytics" ADD CONSTRAINT "AdAnalytics_adSetId_fkey" FOREIGN KEY ("adSetId") REFERENCES "public"."AdSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdAnalytics" ADD CONSTRAINT "AdAnalytics_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdAnalytics" ADD CONSTRAINT "AdAnalytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdSet" ADD CONSTRAINT "AdSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdVariant" ADD CONSTRAINT "AdVariant_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalLog" ADD CONSTRAINT "ApprovalLog_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalLog" ADD CONSTRAINT "ApprovalLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogArticle" ADD CONSTRAINT "BlogArticle_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogArticle" ADD CONSTRAINT "BlogArticle_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogArticle" ADD CONSTRAINT "BlogArticle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."BlogProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogArticleVersion" ADD CONSTRAINT "BlogArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."BlogArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogGenerationLog" ADD CONSTRAINT "BlogGenerationLog_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."BlogArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogProject" ADD CONSTRAINT "BlogProject_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogProject" ADD CONSTRAINT "BlogProject_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogSEOReport" ADD CONSTRAINT "BlogSEOReport_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."BlogArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogTemplate" ADD CONSTRAINT "BlogTemplate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogTemplate" ADD CONSTRAINT "BlogTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."BlogProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandProfile" ADD CONSTRAINT "BrandProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessMember" ADD CONSTRAINT "BusinessMember_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessMember" ADD CONSTRAINT "BusinessMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessProfile" ADD CONSTRAINT "BusinessProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessProfileVersion" ADD CONSTRAINT "BusinessProfileVersion_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "public"."BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessSummary" ADD CONSTRAINT "BusinessSummary_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "public"."BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campaign" ADD CONSTRAINT "Campaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignLaunch" ADD CONSTRAINT "CampaignLaunch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignLaunch" ADD CONSTRAINT "CampaignLaunch_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentAIHistory" ADD CONSTRAINT "CommentAIHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentAIHistory" ADD CONSTRAINT "CommentAIHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentDraft" ADD CONSTRAINT "ContentDraft_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentDraft" ADD CONSTRAINT "ContentDraft_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentDraft" ADD CONSTRAINT "ContentDraft_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentGenerationContext" ADD CONSTRAINT "ContentGenerationContext_contentDraftId_fkey" FOREIGN KEY ("contentDraftId") REFERENCES "public"."ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentRecommendation" ADD CONSTRAINT "ContentRecommendation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentRecommendation" ADD CONSTRAINT "ContentRecommendation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentUniquenessLog" ADD CONSTRAINT "ContentUniquenessLog_contentDraftId_fkey" FOREIGN KEY ("contentDraftId") REFERENCES "public"."ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DraftComment" ADD CONSTRAINT "DraftComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DraftComment" ADD CONSTRAINT "DraftComment_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DraftComment" ADD CONSTRAINT "DraftComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."DraftComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageStorage" ADD CONSTRAINT "ImageStorage_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageStorage" ADD CONSTRAINT "ImageStorage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "public"."KnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "public"."KnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManualOverride" ADD CONSTRAINT "ManualOverride_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManualOverride" ADD CONSTRAINT "ManualOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptimizationRule" ADD CONSTRAINT "OptimizationRule_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptimizationSuggestion" ADD CONSTRAINT "OptimizationSuggestion_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlatformCredential" ADD CONSTRAINT "PlatformCredential_adAccountId_fkey" FOREIGN KEY ("adAccountId") REFERENCES "public"."AdAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlatformCredential" ADD CONSTRAINT "PlatformCredential_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."ContentDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "public"."SocialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewRequest" ADD CONSTRAINT "ReviewRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialAccount" ADD CONSTRAINT "SocialAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionUsage" ADD CONSTRAINT "SubscriptionUsage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuccessfulPattern" ADD CONSTRAINT "SuccessfulPattern_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuccessfulPattern" ADD CONSTRAINT "SuccessfulPattern_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThirdPartyService" ADD CONSTRAINT "ThirdPartyService_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoGenerationJob" ADD CONSTRAINT "VideoGenerationJob_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoGenerationJob" ADD CONSTRAINT "VideoGenerationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoGenerationJob" ADD CONSTRAINT "VideoGenerationJob_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowRun" ADD CONSTRAINT "WorkflowRun_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "public"."WorkflowExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowRun" ADD CONSTRAINT "WorkflowRun_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."WorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowStep" ADD CONSTRAINT "WorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."demo_bookings" ADD CONSTRAINT "demo_bookings_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."demo_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."demo_leads" ADD CONSTRAINT "demo_leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_generation_jobs" ADD CONSTRAINT "image_generation_jobs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_generation_jobs" ADD CONSTRAINT "image_generation_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_generation_jobs" ADD CONSTRAINT "image_generation_jobs_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posting_schedule_slots" ADD CONSTRAINT "posting_schedule_slots_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."posting_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posting_schedules" ADD CONSTRAINT "posting_schedules_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhooks" ADD CONSTRAINT "webhooks_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_upload_configs" ADD CONSTRAINT "workflow_upload_configs_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
