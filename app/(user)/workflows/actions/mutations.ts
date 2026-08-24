'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';
import { WorkflowExecutionService } from '@/features/workflow/services/workflow-execution.service';

export async function createWorkflow(data: {
  name: string;
  description?: string;
  trigger: any;
  steps: any[];
  businessId: string;
  uploadConfig?: {
    uploadCategory: 'JOB_PHOTO' | 'BEFORE_AFTER' | 'PRODUCT';
    autoCaption: boolean;
    autoSchedule: boolean;
    scheduleOffsetMinutes: number;
    platform: string;
  } | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  let targetBusinessId = data.businessId;
  if (!targetBusinessId || targetBusinessId === 'placeholder-id') {
    const activeId = await getActiveWorkspaceId();
    if (activeId) {
      targetBusinessId = activeId;
    } else {
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

  const { steps, uploadConfig, ...workflowData } = data;

  const triggerType = workflowData.trigger?.type;
  const isUploadTrigger = triggerType === 'PHOTO_UPLOAD' || triggerType === 'BEFORE_AFTER_UPLOAD';

  const workflow = await prisma.workflow.create({
    data: {
      ...workflowData,
      businessId: targetBusinessId,
      creatorId: session.user.id,
      trigger: {
        type: triggerType,
        config: {
          ...(workflowData.trigger?.config || {}),
          uploadCategory: uploadConfig?.uploadCategory || null,
          autoCaption: uploadConfig?.autoCaption ?? true,
          autoSchedule: uploadConfig?.autoSchedule ?? false,
        },
      },
      steps: {
        create: steps.map((step, idx) => {
          const { id: _, workflowId: __, ...rest } = step;
          return {
            ...rest,
            order: step.order ?? idx,
          };
        }),
      },
      uploadConfig: isUploadTrigger && uploadConfig ? {
        create: {
          uploadCategory: uploadConfig.uploadCategory,
          autoCaption: uploadConfig.autoCaption,
          autoSchedule: uploadConfig.autoSchedule,
          scheduleOffsetMinutes: uploadConfig.scheduleOffsetMinutes,
          platform: uploadConfig.platform,
        },
      } : undefined,
    },
    include: { steps: true, uploadConfig: true },
  });

  revalidatePath('/workflows');
  return workflow;
}

export async function updateWorkflow(id: string, data: {
  name?: string;
  description?: string;
  trigger?: any;
  isActive?: boolean;
  steps?: any[];
  uploadConfig?: {
    uploadCategory: 'JOB_PHOTO' | 'BEFORE_AFTER' | 'PRODUCT';
    autoCaption: boolean;
    autoSchedule: boolean;
    scheduleOffsetMinutes: number;
    platform: string;
  } | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { steps, uploadConfig, ...workflowData } = data;

  const existingWorkflow = await prisma.workflow.findUnique({
    where: { id },
  });

  if (!existingWorkflow) {
    throw new Error(`Workflow with ID ${id} not found`);
  }

  const triggerType = workflowData.trigger?.type;
  const isUploadTrigger = triggerType === 'PHOTO_UPLOAD' || triggerType === 'BEFORE_AFTER_UPLOAD';

  const workflow = await prisma.workflow.update({
    where: { id },
    data: workflowData,
  });

  // Handle upload config if provided
  if (uploadConfig !== undefined) {
    if (isUploadTrigger && uploadConfig) {
      await prisma.workflowUploadConfig.upsert({
        where: { workflowId: id },
        update: {
          uploadCategory: uploadConfig.uploadCategory,
          autoCaption: uploadConfig.autoCaption,
          autoSchedule: uploadConfig.autoSchedule,
          scheduleOffsetMinutes: uploadConfig.scheduleOffsetMinutes,
          platform: uploadConfig.platform,
        },
        create: {
          workflowId: id,
          uploadCategory: uploadConfig.uploadCategory,
          autoCaption: uploadConfig.autoCaption,
          autoSchedule: uploadConfig.autoSchedule,
          scheduleOffsetMinutes: uploadConfig.scheduleOffsetMinutes,
          platform: uploadConfig.platform,
        },
      });
    } else {
      await prisma.workflowUploadConfig.deleteMany({ where: { workflowId: id } });
    }
  }

  if (steps) {
    await prisma.workflowStep.deleteMany({
      where: { workflowId: id }
    });

    if (steps.length > 0) {
      await prisma.workflowStep.createMany({
        data: steps.map((step, idx) => ({
          ...step,
          workflowId: id,
          order: step.order ?? idx,
        }))
      });
    }
  }

  const updatedWorkflow = await prisma.workflow.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: 'asc' } }, uploadConfig: true },
  });

  revalidatePath('/workflows');
  return updatedWorkflow;
}

export async function deleteWorkflow(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.workflow.delete({
    where: { id },
  });

  revalidatePath('/workflows');
  return { success: true };
}

export async function toggleWorkflow(id: string, isActive: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const workflow = await prisma.workflow.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath('/workflows');
  return workflow;
}

export async function runWorkflow(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: { steps: true },
  });

  if (!workflow) throw new Error('Workflow not found');
  if (!workflow.isActive) throw new Error('Cannot run an inactive workflow');

  // Start workflow execution using the execution service
  const execution = await WorkflowExecutionService.startExecution(id);

  // Increment run count and update last run time
  await prisma.workflow.update({
    where: { id },
    data: {
      runCount: { increment: 1 },
      lastRunAt: new Date(),
    },
  });

  revalidatePath('/workflows');
  return { 
    success: true, 
    executionId: execution.id,
    message: 'Workflow execution started' 
  };
}
