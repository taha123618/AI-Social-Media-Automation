import { z } from 'zod';

// Business Profile Validation
export const BusinessProfileSchema = z.object({
  mission: z.string().min(1, 'Mission is required').max(500, 'Mission must be less than 500 characters'),
  vision: z.string().min(1, 'Vision is required').max(500, 'Vision must be less than 500 characters'),
  uvp: z.string().min(1, 'Unique Value Proposition is required').max(300, 'UVP must be less than 300 characters'),
  targetAudience: z.string().min(1, 'Target audience is required').max(300, 'Target audience must be less than 300 characters'),
  tone: z.string().min(1, 'Brand tone is required').max(100, 'Tone must be less than 100 characters'),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must be less than 100 characters'),
  forbiddenWords: z.array(z.string().max(50, 'Forbidden word must be less than 50 characters')).max(20, 'Maximum 20 forbidden words allowed'),
});

export const BusinessProfileUpdateSchema = BusinessProfileSchema.partial();

// Content Generation Validation
export const ContentGenerationSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  intent: z.enum(['SALES', 'EDUCATION', 'EVENT', 'ENGAGEMENT', 'BRAND_AWARENESS'], {
    message: 'Invalid content intent'
  }),
  platforms: z.array(z.enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE'])).min(1, 'At least one platform is required').max(5, 'Maximum 5 platforms allowed'),
  topic: z.string().max(200, 'Topic must be less than 200 characters').optional(),
  customInstructions: z.string().max(3000, 'Custom instructions must be less than 3000 characters').optional(),
  scheduleFor: z.string().datetime().optional(),
});

export const ContentDraftSchema = z.object({
  title: z.string().max(200, 'Title must be less than 200 characters').optional(),
  intent: z.enum(['SALES', 'EDUCATION', 'EVENT', 'ENGAGEMENT', 'BRAND_AWARENESS']),
  platforms: z.array(z.enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE'])),
  customPrompt: z.string().max(3000, 'Custom prompt must be less than 3000 characters').optional(),
  generatedContent: z.object({
    text: z.string().min(1, 'Generated text is required'),
    imagePrompt: z.string().max(500, 'Image prompt must be less than 500 characters').optional(),
    videoScript: z.object({
      hook: z.string().max(200, 'Video hook must be less than 200 characters'),
      body: z.string().max(1000, 'Video body must be less than 1000 characters'),
      cta: z.string().max(200, 'Video CTA must be less than 200 characters'),
      durationSeconds: z.number().int().min(1, 'Duration must be at least 1 second').max(300, 'Duration must be less than 5 minutes').optional(),
    }).optional(),
    hashtags: z.array(z.string().max(50, 'Hashtag must be less than 50 characters')).max(30, 'Maximum 30 hashtags allowed'),
    cta: z.string().max(200, 'CTA must be less than 200 characters').optional(),
  }),
});

// Approval Validation
export const ApprovalRequestSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED'], {
    message: 'Invalid approval status'
  }),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

export const BulkApprovalSchema = z.object({
  draftIds: z.array(z.string()).min(1, 'At least one draft ID is required').max(50, 'Maximum 50 drafts can be approved at once'),
  userId: z.string().min(1, 'User ID is required'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

// Scheduling Validation
export const SchedulingOptionsSchema = z.object({
  postsPerDay: z.number().int().min(1, 'At least 1 post per day').max(20, 'Maximum 20 posts per day'),
  timeZones: z.array(z.string()).min(1, 'At least one timezone is required'),
  optimalTimes: z.record(z.string(), z.array(z.number().int().min(0).max(23))),
  blackoutPeriods: z.array(z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  })).optional(),
  minIntervalBetweenPosts: z.number().int().min(30, 'Minimum interval is 30 minutes').max(1440, 'Maximum interval is 24 hours'),
});

export const SchedulePostSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  scheduledTime: z.string().datetime('Invalid datetime format'),
});

export const ReschedulePostsSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  schedulingOptions: SchedulingOptionsSchema,
});

// Social Account Validation
export const SocialAccountSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  platform: z.enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE']),
  accountId: z.string().min(1, 'Account ID is required'),
  accountName: z.string().min(1, 'Account name is required').max(100, 'Account name must be less than 100 characters'),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// Knowledge Base Validation
export const KnowledgeDocumentSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename must be less than 255 characters'),
  fileType: z.string().min(1, 'File type is required').max(50, 'File type must be less than 50 characters'),
  s3Key: z.string().optional(),
  sourceUrl: z.string().url('Invalid URL format').optional(),
});

export const KnowledgeSearchSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  query: z.string().min(1, 'Search query is required').max(500, 'Query must be less than 500 characters'),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(20, 'Maximum 20 results allowed').default(5),
});

// Analytics Validation
export const AnalyticsQuerySchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  platforms: z.array(z.enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE'])).optional(),
  intents: z.array(z.enum(['SALES', 'EDUCATION', 'EVENT', 'ENGAGEMENT', 'BRAND_AWARENESS'])).optional(),
});

// User and Business Validation
export const BusinessCreateSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Business name must be less than 100 characters'),
  slug: z.string().min(1, 'Business slug is required').max(50, 'Business slug must be less than 50 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  website: z.string().url('Invalid website URL').optional(),
  logo: z.string().url('Invalid logo URL').optional(),
});

export const BusinessMemberSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'], {
    message: 'Invalid user role'
  }),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  image: z.string().url('Invalid image URL').optional(),
});

// API Response Validation
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Queue Job Validation
export const ContentGenerationJobSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  creatorId: z.string().min(1, 'Creator ID is required'),
  intent: z.enum(['SALES', 'EDUCATION', 'EVENT', 'ENGAGEMENT', 'BRAND_AWARENESS']),
  platforms: z.array(z.enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE'])),
  topic: z.string().max(200, 'Topic must be less than 200 characters').optional(),
  customInstructions: z.string().max(3000, 'Custom instructions must be less than 3000 characters').optional(),
  scheduleFor: z.string().datetime().optional(),
});

export const PostingJobSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  businessId: z.string().min(1, 'Business ID is required'),
  platform: z.enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE']),
  socialAccountId: z.string().min(1, 'Social account ID is required'),
});

// Error Handling
export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

// Type exports
export type BusinessProfileInput = z.infer<typeof BusinessProfileSchema>;
export type BusinessProfileUpdateInput = z.infer<typeof BusinessProfileUpdateSchema>;
export type ContentGenerationInput = z.infer<typeof ContentGenerationSchema>;
export type ContentDraftInput = z.infer<typeof ContentDraftSchema>;
export type ApprovalRequestInput = z.infer<typeof ApprovalRequestSchema>;
export type BulkApprovalInput = z.infer<typeof BulkApprovalSchema>;
export type SchedulingOptionsInput = z.infer<typeof SchedulingOptionsSchema>;
export type SchedulePostInput = z.infer<typeof SchedulePostSchema>;
export type ReschedulePostsInput = z.infer<typeof ReschedulePostsSchema>;
export type SocialAccountInput = z.infer<typeof SocialAccountSchema>;
export type KnowledgeDocumentInput = z.infer<typeof KnowledgeDocumentSchema>;
export type KnowledgeSearchInput = z.infer<typeof KnowledgeSearchSchema>;
export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
export type BusinessCreateInput = z.infer<typeof BusinessCreateSchema>;
export type BusinessMemberInput = z.infer<typeof BusinessMemberSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type PaginatedResponse<T = unknown> = z.infer<typeof PaginatedResponseSchema> & { data: T[] };
export type ContentGenerationJobInput = z.infer<typeof ContentGenerationJobSchema>;
export type PostingJobInput = z.infer<typeof PostingJobSchema>;
export type ErrorInfo = z.infer<typeof ErrorSchema>;

// Validation helpers
export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw error;
  }
};

export const validatePartial = <T>(schema: z.ZodSchema<T>, input: unknown): Partial<T> => {
  try {
    if (schema instanceof z.ZodObject) {
      return schema.partial().parse(input) as Partial<T>;
    }
    return schema.parse(input) as Partial<T>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw error;
  }
};
