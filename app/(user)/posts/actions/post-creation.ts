'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Platform as GeneratedPlatform, ContentIntent, ContentStatus } from '@/app/generated/prisma/enums';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';
import { AppError, ErrorCode } from '@/lib/error-handler';
import { logger, measurePerformance } from '@/lib/logging';
import { ImageStorageService } from '@/services/image-storage.service';
import {
  CreateContentWithScheduleSchema,
  SaveDraftSchema,
  SchedulePostSchema,
  PublishPostNowSchema,
  CreateContentWithScheduleInput,
  SaveDraftInput,
  PublishPostNowInput
} from '@/features/post-creation/schemas/post-creation.schema';

export async function createContentWithSchedule(data: CreateContentWithScheduleInput) {
  // Validate input using Zod schema
  const validatedData = CreateContentWithScheduleSchema.parse(data);
  return measurePerformance('createContentWithSchedule', async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new AppError('Unauthorized access', ErrorCode.UNAUTHORIZED, 401);
    }

    const businessId = await getActiveWorkspaceId();
    if (!businessId) {
      throw new AppError('No active workspace found', ErrorCode.WORKSPACE_NOT_FOUND, 404);
    }

    // Helper function to process and upload files
    const processMediaFiles = async (files: File[] | undefined, existingUrls: string[] = []) => {
      const urls = [...existingUrls];
      if (files?.length) {
        for (const file of files) {
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const image = await ImageStorageService.ingestImageFromBuffer(
              buffer,
              file.name,
              file.type,
              { businessId, userId: session.user.id }
            );
            urls.push(image.url);
          } catch (err) {
            logger.error('Failed to upload media file', { fileName: file.name, error: err });
          }
        }
      }
      return urls;
    };

    try {
      const finalMediaUrls = await processMediaFiles(validatedData.mediaFiles, validatedData.mediaUrls);

      // Use transaction for all database operations
      const result = await prisma.$transaction(async (tx) => {
        logger.debug('Starting database transaction for content creation', {
          businessId,
          userId: session.user.id,
          platformCount: validatedData.platforms.length,
          accountCount: validatedData.accountIds.length,
        });

        // Create the content draft
        const contentDraft = await tx.contentDraft.create({
          data: {
            title: validatedData.content.slice(0, 100) + (validatedData.content.length > 100 ? '...' : ''),
            intent: validatedData.intent,
            platforms: validatedData.platforms,
            customPrompt: validatedData.content,
            content: validatedData.content,
            businessId,
            creatorId: session.user.id,
            status: validatedData.isImmediate ? ContentStatus.POSTED : ContentStatus.SCHEDULED,
            scheduledFor: validatedData.isImmediate ? undefined : validatedData.scheduledFor || undefined,
            postedAt: validatedData.isImmediate ? new Date() : undefined,
            contentJson: {
              text: validatedData.content,
              firstComment: validatedData.firstComment,
              mediaFiles: validatedData.mediaFiles?.map(f => f.name) || [],
              mediaUrls: finalMediaUrls,
              labels: validatedData.labels || [],
              accountIds: validatedData.accountIds
            }
          }
        });

        logger.debug('Created content draft', { contentDraftId: contentDraft.id });

        // Verify accounts exist and belong to the business
        const accounts = await tx.socialAccount.findMany({
          where: {
            id: { in: validatedData.accountIds },
            businessId,
            isActive: true
          },
          select: {
            id: true,
            platform: true,
            name: true,
            avatar: true,
            isActive: true
          }
        });

        if (accounts.length !== validatedData.accountIds.length) {
          throw new AppError(
            'Some social accounts are not found or inactive',
            ErrorCode.SOCIAL_ACCOUNT_NOT_CONNECTED,
            404
          );
        }

        logger.debug('Found social accounts', { accountCount: accounts.length });

        // Create Post records directly (linking to ContentDraft)
        const linkedPosts = await Promise.all(
          accounts.map(account =>
            tx.post.create({
              data: {
                businessId,
                creatorId: session.user.id,
                draftId: contentDraft.id,
                platform: account.platform as GeneratedPlatform,
                socialAccountId: account.id,
                scheduledFor: validatedData.isImmediate ? undefined : (validatedData.scheduledFor || undefined),
                postedAt: validatedData.isImmediate ? new Date() : undefined,
                status: validatedData.isImmediate ? ContentStatus.POSTED : ContentStatus.SCHEDULED
              }
            })
          )
        );

        logger.debug('Created and linked posts to content draft', { linkedPostCount: linkedPosts.length });

        // If immediate posting, trigger the publishing process
        if (validatedData.isImmediate) {
          logger.info('Processing immediate posts', { postCount: linkedPosts.length });

          // Note: Since we are in a transaction here, the publishPostNow call needs to
          // execute AFTER the transaction commits so it can find the newly created records.
          // Therefore, we defer it to run as a side-effect after the transaction.
          // (Alternatively we could duplicate the logic here, but deferring is cleaner).
          // We'll return a flag to indicate it needs immediate publishing.
        }

        return {
          contentDraft,
          linkedPosts,
          needsImmediatePublish: validatedData.isImmediate
        };
      });

      // Log successful operation
      logger.logUserAction('Created content with schedule', session.user.id, businessId, {
        contentDraftId: result.contentDraft.id,
        platforms: validatedData.platforms,
        isImmediate: validatedData.isImmediate,
        scheduledFor: validatedData.scheduledFor,
      });

      // Revalidate paths
      revalidatePath('/schedule');
      revalidatePath('/contents');
      revalidatePath('/posts');

      // Execute actual publishing after transaction commits
      if (result.needsImmediatePublish) {
         try {
            await publishPostNow(result.contentDraft.id);
         } catch (publishErr) {
            logger.error('Immediate publish failed after draft creation', {
              error: publishErr,
              draftId: result.contentDraft.id
            });
            // We do not throw here, as the draft was successfully saved.
         }
      }

      return {
        success: true,
        contentDraft: result.contentDraft,
        posts: result.linkedPosts
      };

    } catch (error) {
      // Log error with context
      logger.error('Failed to create content with schedule', {
        error: error instanceof Error ? error : new Error(String(error)),
        businessId,
        userId: session.user.id,
        platforms: validatedData.platforms,
        accountIds: validatedData.accountIds,
      });

      // Clean up object URLs on error
      // cleanupObjectUrls();

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to create content',
        ErrorCode.INTERNAL_SERVER_ERROR,
        500,
        true,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    } finally {
      // Clean up object URLs after successful operations
      // Note: In production, these should be uploaded to storage before cleanup
      // setTimeout(() => cleanupObjectUrls(), 1000); // Delay to allow for processing
    }
  }, {
    businessId: 'unknown', // Will be set inside the function
    operation: 'createContentWithSchedule',
    platforms: validatedData.platforms,
    accountCount: validatedData.accountIds.length,
  });
}

export async function getConnectedSocialAccounts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) return [];

  try {
    const accounts = await prisma.socialAccount.findMany({
      where: {
        businessId,
        isActive: true
      },
      select: {
        id: true,
        platform: true,
        name: true,
        avatar: true,
        isActive: true
      },
      orderBy: [
        { platform: 'asc' },
        { name: 'asc' }
      ]
    });

    return accounts.map(account => ({
      ...account,
      username: account.name || 'Unknown',
      profileImageUrl: account.avatar,
      isConnected: account.isActive
    }));

  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return [];
  }
}

export async function schedulePost(contentId: string, scheduledFor: Date) {
  // Validate input using Zod schema
  const validatedData = SchedulePostSchema.parse({ contentId, scheduledFor });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Resolve the actual ContentDraft ID (it might be a Post ID)
      const resolvedDraft = await tx.contentDraft.findFirst({
        where: {
          OR: [
            { id: contentId },
            { posts: { some: { id: contentId } } }
          ],
          businessId: (await getActiveWorkspaceId()) || '' // Ensure businessId context
        },
        select: { id: true }
      });

      if (!resolvedDraft) throw new Error('Draft not found or unauthorized');

      const draft = await tx.contentDraft.findUnique({
        where: { id: resolvedDraft.id },
        include: { posts: true }
      });

      if (!draft) throw new Error('Draft not found');

      // 1. Ensure Post records exist if accountIds are specified
      const contentJson = (draft.contentJson as Record<string, any>) || {};
      const accountIds: string[] = contentJson.accountIds || [];

      if (draft.posts.length === 0 && accountIds.length > 0) {
        const accounts = await tx.socialAccount.findMany({
          where: { id: { in: accountIds }, businessId: draft.businessId, isActive: true }
        });

        if (accounts.length > 0) {
          await Promise.all(
            accounts.map(account =>
              tx.post.create({
                data: {
                  businessId: draft.businessId,
                  creatorId: draft.creatorId,
                  draftId: draft.id,
                  platform: account.platform as GeneratedPlatform,
                  socialAccountId: account.id,
                  status: 'SCHEDULED',
                  scheduledFor
                }
              })
            )
          );
        }
      } else {
        // 2. Update existing linked posts
        await tx.post.updateMany({
          where: { draftId: resolvedDraft.id },
          data: { scheduledFor, status: 'SCHEDULED' }
        });
      }


      // 3. Update ContentDraft status and time
      return tx.contentDraft.update({
        where: { id: resolvedDraft.id },
        data: {
          scheduledFor,
          status: 'SCHEDULED'
        }
      });

    });

    revalidatePath('/schedule');
    revalidatePath('/posts');
    return result;

  } catch (error) {
    console.error('Error scheduling post:', error);
    throw new Error('Failed to schedule post');
  }
}

export async function saveDraft(data: SaveDraftInput) {
  // Validate input using Zod schema
  const validatedData = SaveDraftSchema.parse(data);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) throw new Error('No active workspace found');

  try {
    const finalMediaUrls = await (async () => {
      const urls = [...(validatedData.mediaUrls || [])];
      if (validatedData.mediaFiles?.length) {
        for (const file of validatedData.mediaFiles) {
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const image = await ImageStorageService.ingestImageFromBuffer(
              buffer,
              file.name,
              file.type,
              { businessId, userId: session.user.id }
            );
            urls.push(image.url);
          } catch (err) {
            logger.error('Failed to auto-save media file', { fileName: file.name, error: err });
          }
        }
      }
      return urls;
    })();

    const draftData = {
      title: validatedData.content.slice(0, 100) + (validatedData.content.length > 100 ? '...' : ''),
      intent: validatedData.intent,
      platforms: validatedData.platforms,
      customPrompt: validatedData.content,
      content: validatedData.content,
      contentJson: {
        text: validatedData.content,
        firstComment: validatedData.firstComment,
        mediaFiles: validatedData.mediaFiles?.map(f => f.name) || [],
        mediaUrls: finalMediaUrls,
        labels: validatedData.labels || [],
        accountIds: validatedData.accountIds,
        postType: 'POST' // Default post type for drafts
      },
      scheduledFor: validatedData.scheduledFor,
      status: validatedData.scheduledFor ? ContentStatus.SCHEDULED : ContentStatus.DRAFT
    };

    let contentDraft;

    if (validatedData.contentId) {
      // Resolve the actual ContentDraft ID (it might be a Post ID)
      const resolvedDraft = await prisma.contentDraft.findFirst({
        where: {
          OR: [
            { id: validatedData.contentId },
            { posts: { some: { id: validatedData.contentId } } }
          ],
          businessId
        },
        select: { id: true }
      });

      if (!resolvedDraft) {
        throw new Error('Post or draft not found or unauthorized');
      }

      contentDraft = await prisma.contentDraft.update({
        where: { id: resolvedDraft.id },
        data: {
          ...draftData,
          updatedAt: new Date()
        }
      });
    } else {
      contentDraft = await prisma.contentDraft.create({
        data: {
          ...draftData,
          businessId,
          creatorId: session.user.id,
          status: 'DRAFT'
        }
      });
    }

    return contentDraft;

  } catch (error) {
    console.error('Error saving draft:', error);
    throw new Error('Failed to save draft');
  }
}

export async function publishPostNow(contentId: string) {
  // Validate input using Zod schema
  const validatedData = PublishPostNowSchema.parse({ contentId });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401);

  const businessId = await getActiveWorkspaceId();
  if (!businessId) throw new AppError('No active workspace found', ErrorCode.WORKSPACE_NOT_FOUND, 404);

  try {
    // Resolve the actual ContentDraft ID (it might be a Post ID)
    const resolvedDraft = await prisma.contentDraft.findFirst({
      where: {
        OR: [
          { id: validatedData.contentId },
          { posts: { some: { id: validatedData.contentId } } }
        ],
        businessId
      },
      select: { id: true }
    });

    if (!resolvedDraft) throw new AppError('Draft not found or unauthorized', ErrorCode.CONTENT_DRAFT_NOT_FOUND, 404);

    // Fetch the draft and its linked accounts
    const draft = await prisma.contentDraft.findUnique({
      where: { id: resolvedDraft.id },
      include: {
        posts: { include: { socialAccount: true } }
      }
    });

    if (!draft) throw new AppError('Draft not found', ErrorCode.CONTENT_DRAFT_NOT_FOUND, 404);

    const { MetaBusinessManagerService } = await import(
      '@/features/social/services/meta-business-manager-extended.service'
    );
    const { Platform } = await import('@/app/generated/prisma/client');

    const contentJson = (draft.contentJson as Record<string, any>) || {};
    const mediaUrls: string[] = contentJson.mediaUrls || (draft.mediaUrl ? [draft.mediaUrl] : []);

    let postsToPublish = draft.posts;

    // If no posts are linked yet, create them based on accountIds in contentJson
    if (postsToPublish.length === 0) {
      const accountIds: string[] = contentJson.accountIds || [];
      if (accountIds.length > 0) {
        // Fetch accounts and create missing post records
        const accounts = await prisma.socialAccount.findMany({
          where: { id: { in: accountIds }, businessId, isActive: true }
        });

        if (accounts.length > 0) {
          await prisma.$transaction(
            accounts.map(account =>
              prisma.post.create({
                data: {
                  businessId,
                  creatorId: session.user.id,
                  draftId: draft.id,
                  platform: account.platform as GeneratedPlatform,
                  socialAccountId: account.id,
                  status: 'POSTED'
                }
              })
            )
          );

          // Refresh draft with newly created posts
          const refreshedDraft = await prisma.contentDraft.findUnique({
            where: { id: draft.id },
            include: { posts: { include: { socialAccount: true } } }
          });
          postsToPublish = refreshedDraft?.posts || [];
        }
      }
    }

    if (postsToPublish.length === 0) {
      throw new AppError('No social accounts selected for this post', ErrorCode.SOCIAL_ACCOUNT_NOT_CONNECTED, 400);
    }

    const publishResults: { success: boolean; platform: string; error?: string }[] = [];

    for (const post of postsToPublish) {
      const account = post.socialAccount;
      if (!account) continue;

      try {
        const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);

        if (account.platform === Platform.FACEBOOK) {
          const result = await MetaBusinessManagerService.publishToFacebook(
            account.platformId,
            accessToken,
            contentJson,
            mediaUrls.length > 0 ? mediaUrls : undefined
          );

          await prisma.post.update({
            where: { id: post.id },
            data: { externalPostId: result.postId, publishedUrl: result.url, postedAt: new Date(), status: 'POSTED' }
          });

          // No separate analytics upsert needed, fields are on the Post model
          publishResults.push({ success: true, platform: 'FACEBOOK' });
        } else if (account.platform === Platform.INSTAGRAM) {
          const containerResult = await MetaBusinessManagerService.publishToInstagram(
            account.platformId,
            accessToken,
            contentJson,
            mediaUrls.length > 0 ? mediaUrls : undefined
          );

          await prisma.post.update({
            where: { id: post.id },
            data: {
              externalPostId: containerResult.containerIds[0],
              publishedUrl: `https://instagram.com`,
              postedAt: new Date(),
              status: 'POSTED'
            }
          });

          // No separate analytics upsert needed
          publishResults.push({ success: true, platform: 'INSTAGRAM' });
        }
      } catch (platformError) {
        logger.error('Failed to publish to platform', {
          platform: account.platform,
          postId: post.id,
          error: platformError
        });
        publishResults.push({ success: false, platform: account.platform, error: `${platformError}` });
      }
    }

    const hasAnySuccess = publishResults.some(r => r.success);

    // Mark draft as posted if at least one platform succeeded
    const updatedContent = await prisma.contentDraft.update({
      where: { id: resolvedDraft.id },

      data: {
        status: hasAnySuccess ? 'POSTED' : 'DRAFT',
        postedAt: hasAnySuccess ? new Date() : undefined,
      }
    });

    revalidatePath('/schedule');
    revalidatePath('/contents');
    revalidatePath('/posts');

    logger.logUserAction('Published post now', session.user.id, businessId, {
      contentDraftId: validatedData.contentId,
      results: publishResults,
    });

    return { ...updatedContent, publishResults };

  } catch (error) {
    logger.error('Error publishing post now', {
      error: error instanceof Error ? error : new Error(String(error)),
      contentId: validatedData.contentId,
    });
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to publish post', ErrorCode.INTERNAL_SERVER_ERROR, 500);
  }
}

export async function getPostDraftById(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();

  logger.info('Attempting to fetch post draft', { id, currentBusinessId: businessId, userId: session.user.id });

  if (!businessId) throw new Error('No active workspace found');

  try {
    // First, let's check if the draft exists at all (without business filter)
    const anyDraft = await prisma.contentDraft.findFirst({
      where: { id },
      select: { id: true, businessId: true, creatorId: true }
    });

    logger.info('Draft existence check', {
      draftId: id,
      found: !!anyDraft,
      foundBusinessId: anyDraft?.businessId,
      foundCreatorId: anyDraft?.creatorId,
      currentBusinessId: businessId,
      currentUserId: session.user.id
    });

    let draft = await prisma.contentDraft.findFirst({
      where: {
        OR: [
          { id },
          { posts: { some: { id } } }
        ],
        businessId
      },
      include: {
        posts: {
          include: {
            socialAccount: true
          }
        }
      }
    });

    // If not found with current business context, try to find it without business filter
    // This handles cases where business context might be wrong but user has access
    if (!draft && anyDraft) {
      logger.warn('Draft not found with current business context, trying fallback', {
        draftId: id,
        currentBusinessId: businessId,
        draftBusinessId: anyDraft.businessId,
        isCreator: anyDraft.creatorId === session.user.id
      });

      // Only allow fallback if the user is the creator
      if (anyDraft.creatorId === session.user.id) {
        draft = await prisma.contentDraft.findFirst({
          where: { id },
          include: {
            posts: {
              include: {
                socialAccount: true
              }
            }
          }
        });

        if (draft) {
          logger.info('Draft found via creator fallback', { draftId: id, fallbackBusinessId: draft.businessId });
        }
      }
    }

    if (!draft) {
      logger.error('Draft not found with any method', {
        id,
        businessId,
        userId: session.user.id,
        anyDraftExists: !!anyDraft
      });
      return null;
    }

    // Get media from draft contentJson
    const allMediaUrls = new Set<string>();
    if (draft.mediaUrl) allMediaUrls.add(draft.mediaUrl);

    let jsonMetadata = (draft.contentJson as any) || {};
    if (typeof jsonMetadata === 'string') {
      try {
        jsonMetadata = JSON.parse(jsonMetadata);
      } catch (e) {
        jsonMetadata = {};
      }
    }
    const jsonMediaUrls = jsonMetadata.mediaUrls || [];
    if (Array.isArray(jsonMediaUrls)) {
      jsonMediaUrls.forEach((url: string) => allMediaUrls.add(url));
    }

    // Resolve selected accounts (either from live posts or previously saved JSON)
    let selectedAccountIds = draft.posts.map(p => p.socialAccountId);
    if (selectedAccountIds.length === 0 && jsonMetadata.accountIds) {
      selectedAccountIds = jsonMetadata.accountIds;
    }

    const result = {
      id: draft.id,
      content: jsonMetadata.text || draft.customPrompt || draft.title || '',
      firstComment: jsonMetadata.firstComment || '',
      platforms: draft.platforms as GeneratedPlatform[],
      status: draft.status,
      scheduledFor: draft.scheduledFor,
      mediaUrls: Array.from(allMediaUrls),
      labels: jsonMetadata.labels || [],
      selectedAccountIds,
      contentJson: draft.contentJson
    };

    logger.info('Draft loaded successfully', { id, mediaCount: result.mediaUrls.length });
    return result;

  } catch (error) {
    logger.error('Error fetching post draft', { id, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}
export async function deletePostDraft(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) throw new Error('No active workspace found');

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify existence and ownership
      // The id could be a ContentDraft ID or a Post ID (returned by /api/posts for published posts)
      const draft = await tx.contentDraft.findFirst({
        where: {
          OR: [
            { id: id },
            { posts: { some: { id: id } } }
          ],
          businessId
        },
        include: { posts: true }
      });

      if (!draft) {
        logger.warn('Delete attempt on non-existent or unauthorized draft', { id, businessId });
        throw new Error('Post not found or unauthorized');
      }

      const realDraftId = draft.id;
      const postIds = draft.posts.map(p => p.id);

      // 2. Cleanup dependent records for each Post
      if (postIds.length > 0) {
        // Delete leads associated with these posts
        await tx.lead.deleteMany({
          where: { postId: { in: postIds } }
        });

        // 3. PostAnalytics are now flattened into Post.

        // Delete the posts themselves
        await tx.post.deleteMany({
          where: { draftId: realDraftId }
        });
      }

      // 3. Delete other relations that might not cascade (if any)
      // Note: ApprovalLog, DraftComment, ManualOverride should cascade per schema

      // 4. Delete the content draft
      const deletedDraft = await tx.contentDraft.delete({
        where: { id: realDraftId }
      });

      logger.info('Post draft and all associated records deleted', {
        id,
        userId: session.user.id,
        postCount: postIds.length
      });

      revalidatePath('/posts');
      return { success: true, deletedDraft };
    });
  } catch (error) {
    // Log the actual error for debugging
    logger.error('Error in deletePostDraft', {
      id,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });

    // Check for specific Prisma errors (e.g., P2003 for foreign key)
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('Foreign key constraint failed')) {
      throw new Error(`Cannot delete: This post has linked records that must be removed first. (${errorMsg})`);
    }

    throw new Error(`Failed to delete post: ${errorMsg}`);
  }
}
export async function duplicatePostDraft(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) throw new Error('No active workspace found');

  try {
    const original = await prisma.contentDraft.findFirst({
      where: {
        OR: [
          { id: id },
          { posts: { some: { id: id } } }
        ],
        businessId
      },
      include: { posts: true }
    });

    if (!original) throw new Error('Post not found');

    const newDraft = await prisma.contentDraft.create({
      data: {
        title: `${original.title} (Copy)`,
        intent: original.intent,
        platforms: original.platforms,
        customPrompt: original.customPrompt,
        businessId,
        creatorId: session.user.id,
        status: 'DRAFT',
        contentJson: original.contentJson as any,
        mediaUrl: original.mediaUrl,
      }
    });

    revalidatePath('/posts');
    return { success: true, newDraft };
  } catch (error) {
    logger.error('Error duplicating post', { id, error });
    throw new Error('Failed to duplicate post');
  }
}

export async function reschedulePostDraft(id: string, scheduledFor: Date) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    // 1. Resolve the draft ID first
    const draft = await prisma.contentDraft.findFirst({
      where: {
        OR: [
          { id: id },
          { posts: { some: { id: id } } }
        ]
      },
      select: { id: true }
    });

    if (!draft) throw new Error('Post not found');

    const updated = await prisma.contentDraft.update({
      where: { id: draft.id },
      data: {
        scheduledFor,
        status: 'SCHEDULED'
      }
    });

    // Also update linked posts if they exist
    await prisma.post.updateMany({
      where: { draftId: draft.id },
      data: { scheduledFor }
    });

    revalidatePath('/posts');
    revalidatePath('/schedule');
    return { success: true, updated };
  } catch (error) {
    logger.error('Error rescheduling post', { id, error });
    throw new Error('Failed to reschedule post');
  }
}

export async function updatePostStatus(id: string, status: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) throw new Error('No active workspace found');

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Resolve the draft ID
      const draft = await tx.contentDraft.findFirst({
        where: {
          OR: [
            { id: id },
            { posts: { some: { id: id } } }
          ],
          businessId
        },
        include: { posts: true }
      });

      if (!draft) throw new Error('Post not found');

      // 2. Update ContentDraft status
      const updatedDraft = await tx.contentDraft.update({
        where: { id: draft.id },
        data: { status: status as ContentStatus }
      });

      // 3. Update all linked SocialPost records
      await tx.post.updateMany({
        where: { draftId: draft.id },
        data: { status: status as ContentStatus }
      });

      logger.info('Status updated successfully', { id, status, userId: session.user.id });
      revalidatePath('/posts');
      return { success: true, updatedDraft };
    });
  } catch (error: any) {
    logger.error('Error updating status', { id, status, error });
    throw new Error(`Failed to update status: ${error?.message || String(error)}`);
  }
}

export async function updatePostLabels(id: string, labels: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) throw new Error('No active workspace found');

  try {
    const draft = await prisma.contentDraft.findFirst({
      where: {
        OR: [
          { id },
          { posts: { some: { id } } }
        ],
        businessId
      },
      select: { id: true, contentJson: true }
    });

    if (!draft) throw new Error('Post not found');

    const currentJson = (draft.contentJson as any) || {};
    const updated = await prisma.contentDraft.update({
      where: { id: draft.id },
      data: {
        contentJson: {
          ...currentJson,
          labels
        }
      }
    });

    revalidatePath('/posts');
    return { success: true, updated };
  } catch (error) {
    logger.error('Error updating labels', { id, error });
    throw new Error('Failed to update labels');
  }
}

export async function togglePostTrash(id: string, isDeleted: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) throw new Error('No active workspace found');

  try {
    const draft = await prisma.contentDraft.findFirst({
      where: {
        OR: [
          { id },
          { posts: { some: { id } } }
        ],
        businessId
      },
      select: { id: true, contentJson: true }
    });

    if (!draft) throw new Error('Post not found');

    const currentJson = (draft.contentJson as any) || {};
    const updated = await prisma.contentDraft.update({
      where: { id: draft.id },
      data: {
        contentJson: {
          ...currentJson,
          isDeleted
        }
      }
    });

    revalidatePath('/posts');
    return { success: true, updated };
  } catch (error) {
    logger.error('Error toggling trash state', { id, error });
    throw new Error('Failed to update trash state');
  }
}
