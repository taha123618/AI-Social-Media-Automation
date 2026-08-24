import { z } from 'zod';
import { Platform as GeneratedPlatform, ContentIntent } from '@/app/generated/prisma/enums';

export const CreateContentWithScheduleSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content cannot exceed 5000 characters'),
  firstComment: z.string().max(2200, 'Comment cannot exceed 2200 characters').optional(),
  platforms: z.array(z.nativeEnum(GeneratedPlatform)).min(1, 'At least one platform must be selected'),
  accountIds: z.array(z.string()).min(1, 'At least one social account must be selected'),
  intent: z.nativeEnum(ContentIntent),
  scheduledFor: z.date().optional().nullable(),
  mediaFiles: z.array(z.instanceof(File)).optional(),
  mediaUrls: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  isImmediate: z.boolean().default(false)
});

export const SaveDraftSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content cannot exceed 5000 characters'),
  firstComment: z.string().max(2200, 'Comment cannot exceed 2200 characters').optional(),
  platforms: z.array(z.nativeEnum(GeneratedPlatform)),
  accountIds: z.array(z.string()),
  intent: z.nativeEnum(ContentIntent),
  scheduledFor: z.date().optional().nullable(),
  mediaFiles: z.array(z.instanceof(File)).optional(),
  mediaUrls: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  contentId: z.string().optional()
});

export const SchedulePostSchema = z.object({
  contentId: z.string(),
  scheduledFor: z.date().min(new Date(), 'Scheduled date must be in the future')
});

export const PublishPostNowSchema = z.object({
  contentId: z.string()
});

export type CreateContentWithScheduleInput = z.infer<typeof CreateContentWithScheduleSchema>;
export type SaveDraftInput = z.infer<typeof SaveDraftSchema>;
export type SchedulePostInput = z.infer<typeof SchedulePostSchema>;
export type PublishPostNowInput = z.infer<typeof PublishPostNowSchema>;
