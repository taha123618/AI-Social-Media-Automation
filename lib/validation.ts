import { z } from 'zod';
import { Platform, ContentIntent, ContentStatus, UserRole, BusinessType } from '@/types';

// Common validation schemas
export const idSchema = z.string().min(1, 'ID is required').cuid('Invalid ID format');

export const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');

export const urlSchema = z.string().url('Invalid URL format').optional().or(z.literal(''));

export const dateSchema = z.string().datetime('Invalid date format').optional().or(z.literal(''));

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});

export const businessIdSchema = z.string().min(1, 'Business ID is required');

// Platform validation
export const platformSchema = z.nativeEnum(Platform, {
  message: 'Invalid platform selected'
});

export const platformsSchema = z.array(platformSchema).min(1, 'At least one platform must be selected');

export const contentIntentSchema = z.nativeEnum(ContentIntent, {
  message: 'Invalid content intent'
});

export const contentStatusSchema = z.nativeEnum(ContentStatus, {
  message: 'Invalid content status'
});

export const userRoleSchema = z.nativeEnum(UserRole, {
  message: 'Invalid user role'
});

export const businessTypeSchema = z.nativeEnum(BusinessType, {
  message: 'Invalid business type'
});

// Content validation schemas
export const contentSchema = z.string()
  .min(1, 'Content is required')
  .max(5000, 'Content cannot exceed 5000 characters')
  .trim();

export const titleSchema = z.string()
  .min(1, 'Title is required')
  .max(200, 'Title cannot exceed 200 characters')
  .trim();

export const customPromptSchema = z.string()
  .max(2000, 'Custom prompt cannot exceed 2000 characters')
  .trim()
  .optional();

export const accountIdsSchema = z.array(idSchema)
  .min(1, 'At least one social account must be selected')
  .max(10, 'Cannot select more than 10 accounts at once');

// Business profile validation
export const businessProfileSchema = z.object({
  mission: z.string().max(500, 'Mission cannot exceed 500 characters').trim().optional(),
  vision: z.string().max(500, 'Vision cannot exceed 500 characters').trim().optional(),
  uvp: z.string().max(300, 'UVP cannot exceed 300 characters').trim().optional(),
  targetAudience: z.string().max(500, 'Target audience cannot exceed 500 characters').trim().optional(),
  tone: z.string().max(100, 'Tone cannot exceed 100 characters').trim().optional(),
  industry: z.string().max(100, 'Industry cannot exceed 100 characters').trim().optional(),
  forbiddenWords: z.array(z.string().trim()).optional(),
  brandTone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'CREATIVE', 'TECHNICAL', 'LUXURY', 'CASUAL']).optional(),
  usp: z.string().max(300, 'USP cannot exceed 300 characters').trim().optional(),
  colorPalette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')).max(10, 'Cannot have more than 10 colors').optional(),
  watermark: z.string().max(50, 'Watermark cannot exceed 50 characters').trim().optional(),
});

// User settings validation
export const userSettingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(2, 'Language code is required').max(5, 'Invalid language code'),
  criticalInfrastructureUpdates: z.boolean(),
  strategicIntelligence: z.boolean(),
  osLevelSignals: z.boolean(),
  contentPhaseSuccess: z.boolean(),
  securityFirewallAlerts: z.boolean(),
  collaboratorInvitations: z.boolean(),
  globalSystemHealth: z.boolean(),
});

// API request schemas
export const createContentRequestSchema = z.object({
  content: contentSchema,
  platforms: platformsSchema,
  accountIds: accountIdsSchema,
  intent: contentIntentSchema,
  scheduledFor: dateSchema,
  isImmediate: z.boolean().default(false),
});

export const updateContentRequestSchema = z.object({
  title: titleSchema.optional(),
  platforms: platformsSchema.optional(),
  customPrompt: customPromptSchema.optional(),
  intent: contentIntentSchema.optional(),
  status: contentStatusSchema.optional(),
  scheduledFor: dateSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const bulkOperationRequestSchema = z.object({
  ids: z.array(idSchema).min(1, 'At least one ID must be provided').max(50, 'Cannot process more than 50 items at once'),
  operation: z.enum(['delete', 'update']),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const schedulePostRequestSchema = z.object({
  contentId: idSchema,
  scheduledFor: z.string().datetime('Invalid date format').refine(
    (date) => new Date(date) > new Date(),
    { message: 'Scheduled date must be in the future' }
  ),
});

export const publishPostRequestSchema = z.object({
  contentId: idSchema,
});

// OAuth validation schemas
export const oauthAuthRequestSchema = z.object({
  businessId: businessIdSchema,
});

export const oauthCallbackRequestSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

// Social media account validation
export const socialAccountSchema = z.object({
  platform: platformSchema,
  platformId: z.string().min(1, 'Platform ID is required'),
  name: z.string().max(100, 'Name cannot exceed 100 characters').trim().optional(),
  avatar: urlSchema,
  profileUrl: urlSchema,
  isActive: z.boolean().default(true),
});

// File validation
export const fileSchema = z.instanceof(File).refine(
  (file) => file.size <= 10 * 1024 * 1024, // 10MB
  { message: 'File size cannot exceed 10MB' }
).refine(
  (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    return allowedTypes.includes(file.type);
  },
  { message: 'File type must be an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM)' }
);

export const mediaFilesSchema = z.array(fileSchema)
  .min(0, 'Media files array cannot be negative')
  .max(5, 'Cannot upload more than 5 files at once');

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters').trim(),
  platforms: z.array(platformSchema).optional(),
  status: z.array(contentStatusSchema).optional(),
  dateRange: z.object({
    from: z.string().datetime('Invalid start date').optional(),
    to: z.string().datetime('Invalid end date').optional(),
  }).optional(),
  ...paginationSchema.shape,
});

// Team invitation validation
export const teamInvitationSchema = z.object({
  email: emailSchema,
  role: userRoleSchema.refine(
    (role) => role !== 'OWNER',
    { message: 'Cannot invite someone as OWNER' }
  ),
});

export const bulkTeamInvitationSchema = z.object({
  emails: z.array(emailSchema).min(1, 'At least one email is required').max(20, 'Cannot invite more than 20 people at once'),
  role: userRoleSchema.refine(
    (role) => role !== 'OWNER',
    { message: 'Cannot invite people as OWNER' }
  ),
});

// Review validation
export const reviewSchema = z.object({
  source: z.enum(['GOOGLE', 'YELP', 'FACEBOOK', 'TRIPADVISOR', 'DIRECT', 'OTHER']),
  externalId: z.string().optional(),
  reviewerName: z.string().min(1, 'Reviewer name is required').max(100, 'Reviewer name cannot exceed 100 characters').trim(),
  reviewerEmail: emailSchema.optional(),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  reviewText: z.string().max(2000, 'Review text cannot exceed 2000 characters').trim().optional(),
  reviewDate: z.string().datetime('Invalid review date'),
  platformUrl: urlSchema,
});

// Validation helper functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      throw new Error(`Validation failed: ${formattedErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

export function validateRequestBody<T>(schema: z.ZodSchema<T>, request: Request): Promise<T> {
  return request.json().then(data => validateRequest(schema, data));
}

export function validateSearchParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const data: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    // Handle arrays (e.g., platforms[]=facebook&platforms[]=twitter)
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!data[arrayKey]) {
        data[arrayKey] = [];
      }
      (data[arrayKey] as string[]).push(value);
    } else {
      data[key] = value;
    }
  }

  return validateRequest(schema, data);
}

// Middleware for API routes
export function withValidation<T>(schema: z.ZodSchema<T>, handler: (req: Request, data: T) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      const data = await validateRequestBody(schema, req);
      return await handler(req, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        }, { status: 400 });
      }

      return Response.json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }, { status: 500 });
    }
  };
}

// Type guards
export function isValidPlatform(value: unknown): value is Platform {
  return platformSchema.safeParse(value).success;
}

export function isValidContentIntent(value: unknown): value is ContentIntent {
  return contentIntentSchema.safeParse(value).success;
}

export function isValidContentStatus(value: unknown): value is ContentStatus {
  return contentStatusSchema.safeParse(value).success;
}
