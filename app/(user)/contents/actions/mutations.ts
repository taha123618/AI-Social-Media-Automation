'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { ContentIntent, Platform, ContentStatus } from '@/app/generated/prisma/enums';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';

export async function createContentDraft(data: {
  title: string;
  intent: ContentIntent;
  platforms: Platform[];
  customPrompt?: string;
  businessId: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  let targetBusinessId = data.businessId;
  if (!targetBusinessId || targetBusinessId === 'placeholder-id') {
    const activeId = await getActiveWorkspaceId();
    if (activeId) {
      targetBusinessId = activeId;
    } else {
      // Create a default business for the user to unblock them
      const business = await prisma.business.create({
        data: {
          name: `${session.user.name || 'My'}'s Workspace`,
          slug: `${session.user.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}-workspace-${Date.now().toString().slice(-4)}`,
          members: {
            create: {
              userId: session.user.id,
              role: 'OWNER',
            },
          },
        },
      });
      targetBusinessId = business.id;
    }
  }

  const draft = await prisma.contentDraft.create({
    data: {
      title: data.title,
      intent: data.intent,
      platforms: data.platforms,
      customPrompt: data.customPrompt,
      businessId: targetBusinessId,
      creatorId: session.user.id,
      status: 'GENERATED',
      content: data.customPrompt || data.title,
      contentJson: { text: data.customPrompt || data.title }
    },
  });

  revalidatePath('/contents');
  return draft;
}

export async function updateContentDraft(id: string, data: {
  title?: string;
  intent?: ContentIntent;
  platforms?: Platform[];
  customPrompt?: string;
  contentText?: string; // Add explicit text to save
  status?: ContentStatus;
  scheduledFor?: Date | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const dataToUpdate: any = {
    title: data.title,
    intent: data.intent,
    platforms: data.platforms,
    customPrompt: data.customPrompt,
    status: data.status,
    scheduledFor: data.scheduledFor,
  };

  if (data.contentText) {
    dataToUpdate.content = data.contentText;
    // We update contentJson's text field while preserving other parts of the JSON if possible
    // Note: Since contentJson is complex, we'll fetch existing first or just overwrite text
    dataToUpdate.contentJson = { text: data.contentText };
  } else if (!data.status && !data.scheduledFor) {
     // Fallback for creation/legacy items that don't have content text yet
     // but only if we are actually editing content-related fields
     if (data.customPrompt || data.title) {
       dataToUpdate.content = data.customPrompt || data.title;
       dataToUpdate.contentJson = { text: data.customPrompt || data.title };
     }
  }

  const draft = await prisma.contentDraft.update({
    where: { id },
    data: dataToUpdate,
  });

  revalidatePath('/contents');
  revalidatePath('/schedule');
  return draft;
}

export async function deleteContentDraft(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.contentDraft.delete({
    where: { id },
  });

  revalidatePath('/contents');
  revalidatePath('/schedule');
  return { success: true };
}

export async function updateSchedule(id: string, scheduledFor: Date | null) {
  return updateContentDraft(id, {
    scheduledFor,
    status: scheduledFor ? 'SCHEDULED' : 'APPROVED'
  });
}

export async function generateContentWithAI(data: {
  businessId: string;
  intent: ContentIntent;
  platforms: Platform[];
  topic: string;
  customInstructions?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Call the generation API
  const res = await fetch(`${process.env.APP_URL}/api/generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.id}`,
      'x-business-id': data.businessId,
    },
    body: JSON.stringify({
      intent: data.intent,
      platforms: data.platforms,
      topic: data.topic,
      customInstructions: data.customInstructions,
      async: true
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate content');
  }

  const result = await res.json();
  revalidatePath('/contents');
  return result;
}

export async function bulkUpdateContentStatus(ids: string[], status: ContentStatus) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.contentDraft.updateMany({
    where: {
      id: { in: ids }
    },
    data: {
      status
    }
  });

  revalidatePath('/contents');
  revalidatePath('/schedule');
  return { success: true };
}

export async function bulkDeleteContentDrafts(ids: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.$transaction(async (tx) => {
    // 1. Find all post IDs related to these drafts
    const posts = await tx.post.findMany({
      where: { draftId: { in: ids } },
      select: { id: true }
    });
    const postIds = posts.map(p => p.id);

    if (postIds.length > 0) {
      // 2. Delete dependent records (Leads)
      await tx.lead.deleteMany({
        where: { postId: { in: postIds } }
      });

      // 3. PostAnalytics are now flattened into Post, so they are deleted automatically with the post.

      // 4. Delete the Posts themselves
      await tx.post.deleteMany({
        where: { draftId: { in: ids } }
      });
    }

    // 5. Delete the ContentDrafts
    await tx.contentDraft.deleteMany({
      where: {
        id: { in: ids }
      }
    });
  }, {
    timeout: 10000 // 10 seconds timeout
  });

  revalidatePath('/contents');
  revalidatePath('/schedule');
  return { success: true };
}
