'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { KnowledgeService } from '@/features/knowledge/services/knowledge.service';
import { BusinessProfileInput } from '@/features/knowledge/types';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import { AppError, ErrorCode } from '@/lib/error-handler';

/**
 * Update the business profile settings
 */
export async function updateKnowledgeProfile(data: BusinessProfileInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new AppError('Business not found', ErrorCode.WORKSPACE_NOT_FOUND, 404);

  await KnowledgeService.updateProfile(businessId, session.user.id, data);
  revalidatePath('/knowledge');
  return { success: true };
}

/**
 * Get all knowledge documents for the current business
 */
export async function getKnowledgeDocuments(search: string = '') {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return [];

  // 1. Ensure KnowledgeBase exists for this business
  let kb = await prisma.knowledgeBase.findUnique({ where: { businessId: businessId } });
  if (!kb) {
    kb = await prisma.knowledgeBase.create({ data: { businessId: businessId } });
  }

  // 2. Fetch documents
  return await prisma.knowledgeDocument.findMany({
    where: {
      knowledgeBaseId: kb.id,
      ...(search ? {
        filename: { contains: search, mode: 'insensitive' }
      } : {})
    },
    orderBy: { uploadedAt: 'desc' }
  });
}

/**
 * Register a new document in the knowledge base
 */
export async function registerKnowledgeDocument(name: string, type: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new AppError('Business not found', ErrorCode.WORKSPACE_NOT_FOUND, 404);

  const document = await KnowledgeService.registerDocument(businessId, {
    name,
    type,
    key: `uploads/${name}`,
    url: `https://ai-social-media.s3.amazonaws.com/knowledge/${name}`
  });

  revalidatePath('/knowledge');
  return document;
}

/**
 * Get the brand profile
 */
export async function getKnowledgeProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return null;

  return await KnowledgeService.getProfile(businessId, session.user.id);
}

/**
 * Search knowledge chunks using vector similarity
 */
export async function searchKnowledgeChunks(query: string, limit: number = 5) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return [];

  return await KnowledgeService.searchKnowledgeChunks(businessId, query, limit);
}

/**
 * Get profile versioning history
 */
export async function getProfileVersions() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return [];

  return await KnowledgeService.getProfileVersions(businessId, session.user.id);
}

/**
 * Rollback business profile to previous version
 */
export async function rollbackToProfileVersion(versionNumber: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new AppError('Business not found', ErrorCode.WORKSPACE_NOT_FOUND, 404);

  await KnowledgeService.rollbackProfileVersion(businessId, session.user.id, versionNumber);
  revalidatePath('/knowledge');
  return { success: true };
}

/**
 * Get the current brand summary (approved or generated)
 */
export async function getBusinessSummary() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return null;

  const profile = await prisma.businessProfile.findUnique({
    where: { businessId },
    include: { summaries: true }
  });

  return profile?.summaries || null;
}

/**
 * Trigger AI summaries generation
 */
export async function generateBusinessSummaryAI() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new AppError('Business not found', ErrorCode.WORKSPACE_NOT_FOUND, 404);

  const summary = await KnowledgeService.generateAISummaries(businessId, session.user.id);
  revalidatePath('/knowledge');
  return summary;
}

/**
 * Approve or unapprove the brand summaries DNA
 */
export async function approveBusinessSummary(approve: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new AppError('Business not found', ErrorCode.WORKSPACE_NOT_FOUND, 404);

  const summary = await KnowledgeService.approveSummary(businessId, session.user.id, approve);
  revalidatePath('/knowledge');
  return summary;
}

/**
 * Manually update/override the Brand DNA summary
 */
export async function updateBusinessSummaryOverride(data: {
  shortSummary?: string;
  detailedOverview?: string;
  elevatorPitch?: string;
  marketingPositioning?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new AppError('Business not found', ErrorCode.WORKSPACE_NOT_FOUND, 404);

  const summary = await KnowledgeService.overrideSummary(businessId, session.user.id, data);
  revalidatePath('/knowledge');
  return summary;
}

/**
 * Run and retrieve brand DNA checklist quality auditing results
 */
export async function getProfileValidationResults() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return { complete: false, missingFields: [], conflicts: [] };

  return await KnowledgeService.validateProfileCompleteness(businessId, session.user.id);
}
