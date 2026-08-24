import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION_CONFIG, QUEUE_NAMES } from '../../scheduler/config/queue.config';
import prisma from '@/lib/prisma';
import { QueueManager } from '@/features/scheduler/config/queue.config';
import { SystemLogger } from '@/features/system/services/logger.service';
import { GenerationService } from '@/features/generation/services/generation.service';
import { WorkflowExecutionJob } from '../services/workflow-execution.service';


console.log('[Worker] Initializing workflow-execution worker...');

// Initialize all queues before starting worker
QueueManager.initializeQueues();

interface StepContext {
  workflowId: string;
  executionId: string;
  stepId: string;
  triggerData?: Record<string, unknown>;
  businessId: string;
  creatorId: string;
  creatorEmail?: string;
  state: Record<string, any>;
}

const worker = new Worker(
  QUEUE_NAMES.WORKFLOW,
  async (job: Job<WorkflowExecutionJob>) => {
    const { workflowId, executionId, triggerData } = job.data;
    const queueName = QUEUE_NAMES.WORKFLOW;

    SystemLogger.logQueue({ queueName, jobId: job.id!, status: 'START', message: `Executing workflow ${workflowId}` });
    console.log(`[Job ${job.id}] Executing workflow ${workflowId}...`);

    try {
      await SystemLogger.logActivity({
        action: 'WORKFLOW_EXECUTION_STARTED',
        entity: 'WorkflowExecution',
        entityId: executionId,
        details: { workflowId, triggerType: triggerData?.type }
      });
      // Update execution status to RUNNING
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      // Get workflow with steps
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          steps: { orderBy: { order: 'asc' } },
          runs: {
            where: { executionId },
            include: { step: true },
          },
          creator: true,
        },
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Execute each step sequentially
      const workflowWithRuns = workflow as any;
      let workflowState: Record<string, any> = {
        ...(triggerData || {}),
        businessId: workflow.businessId,
        workflowId: workflow.id,
      };

      for (const run of workflowWithRuns.runs) {
        const step = run.step;

        // Update run status to RUNNING
        await prisma.workflowRun.update({
          where: { id: run.id },
          data: {
            status: 'RUNNING',
            startedAt: new Date(),
          },
        });

        SystemLogger.logQueue({
          queueName,
          jobId: job.id!,
          status: 'START',
          message: `Step started: ${step.name} (${step.type})`
        });

        await SystemLogger.logActivity({
          action: 'WORKFLOW_STEP_STARTED',
          entity: 'WorkflowStep',
          entityId: step.id,
          details: { workflowId, executionId, stepType: step.type }
        });

        try {
          // Resolve config with state (simple interpolation)
          const resolvedConfig = resolveConfig(step.config as Record<string, any>, workflowState);

          // Execute step based on type
          const result = await executeStep(step.type, resolvedConfig, {
            workflowId,
            executionId,
            stepId: step.id,
            triggerData,
            businessId: workflow.businessId,
            creatorId: workflow.creatorId,
            creatorEmail: (workflow as any).creator?.email,
            state: workflowState,
          });

          // Update state with result
          if (result) {
            workflowState = { ...workflowState, ...result };
          }

          // Update run status to COMPLETED
          await prisma.workflowRun.update({
            where: { id: run.id },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
              result: (result || {}) as any,
            },
          });

          await SystemLogger.logActivity({
            action: 'WORKFLOW_STEP_COMPLETED',
            entity: 'WorkflowStep',
            entityId: step.id,
            details: { workflowId, executionId, stepType: step.type }
          });
        } catch (stepError: any) {
          const stepMsg = `Step ${step.id} failed: ${stepError.message}`;
          console.error(`[Job ${job.id}] ${stepMsg}`);

          SystemLogger.logQueue({
            queueName,
            jobId: job.id!,
            status: 'FAILURE',
            message: stepMsg,
            error: stepError
          });

          await SystemLogger.logError({
            message: stepError.message || `Step ${step.name} failed`,
            source: 'WorkflowExecution.executeStep',
            context: { workflowId, executionId, stepId: step.id, stepType: step.type }
          });

          // Update run status to FAILED
          await prisma.workflowRun.update({
            where: { id: run.id },
            data: {
              status: 'FAILED',
              completedAt: new Date(),
              error: stepError.message || 'Step execution failed',
            },
          });

          // Update execution status to FAILED
          await prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
              status: 'FAILED',
              completedAt: new Date(),
              error: `Step "${step.name}" failed: ${stepError.message}`,
            },
          });

          throw stepError;
        }
      }

      // Update execution status to COMPLETED
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          result: { message: 'Workflow executed successfully' },
        },
      });

      await SystemLogger.logActivity({
        action: 'WORKFLOW_EXECUTION_COMPLETED',
        entity: 'WorkflowExecution',
        entityId: executionId,
        details: { workflowId }
      });

      SystemLogger.logQueue({
        queueName,
        jobId: job.id!,
        status: 'SUCCESS',
        message: 'Workflow execution completed successfully'
      });
      console.log(`[Job ${job.id}] Workflow execution completed successfully`);
      return { success: true, executionId };
    } catch (error: any) {
      console.error(`[Job ${job.id}] Workflow execution failed:`, error);

      SystemLogger.logQueue({
        queueName,
        jobId: job.id!,
        status: 'FAILURE',
        message: `Workflow execution failed: ${error.message}`,
        error
      });

      await SystemLogger.logError({
        message: error.message || "Workflow execution failed",
        source: "WorkflowExecutionWorker",
        context: { workflowId, executionId }
      });

      // Ensure execution is marked as failed
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message || 'Workflow execution failed',
        },
      }).catch(err => {
        console.error('Failed to update execution status:', err);
      });

      throw error;
    }
  },

  {
    connection: REDIS_CONNECTION_CONFIG,
    concurrency: 5,
  }
);

// Step execution handler
async function executeStep(
  type: string,
  config: Record<string, unknown>,
  context: StepContext
): Promise<Record<string, unknown> | null> {
  console.log(`[Step ${context.stepId}] Executing ${type}...`);

  switch (type) {
    case 'CONTENT_GENERATION':
      return await executeContentGeneration(config, context);

    case 'CONTENT_REVIEW':
      return await executeContentReview(config, context);

    case 'CONTENT_SCHEDULING':
      return await executeContentScheduling(config, context);

    case 'CONTENT_POSTING':
      return await executeContentPosting(config, context);

    case 'NOTIFICATION':
      return await executeNotification(config, context);

    case 'CUSTOM':
      return await executeCustom(config, context);

    default:
      console.warn(`[Step ${context.stepId}] Unknown step type: ${type}`);
      return null;
  }
}

async function executeContentGeneration(
  config: Record<string, unknown>,
  context: StepContext
): Promise<Record<string, unknown>> {
  console.log(`[ContentGeneration] Executing for business ${context.businessId}...`);
  try {
    // Call GenerationService directly for synchronous execution within the workflow
    const draft = await GenerationService.generateDraft(
      context.businessId,
      context.creatorId,
      {
        intent: (config.intent as any) || 'ENGAGEMENT',
        platforms: (config.platforms as any) || ['LINKEDIN'],
        topic: config.topic as string,
        customInstructions: config.customInstructions as string,
        workflowId: context.workflowId,
        executionId: context.executionId,
      }
    );

    return {
      draftId: draft.id,
      status: 'GENERATED',
      platform: draft.platforms[0],
    };
  } catch (error) {
    console.error('[ContentGeneration] Failed:', error);
    return { error: String(error) };
  }
}

async function executeContentReview(
  config: Record<string, unknown>,
  context: StepContext
): Promise<Record<string, unknown>> {
  // Content review is typically a human-in-the-loop step
  // For now, we'll just mark it as needing review
  return {
    status: 'pending_review',
    requireApproval: config.requireApproval || false,
    message: 'Content is pending review'
  };
}

async function executeContentScheduling(
  config: Record<string, unknown>,
  context: StepContext
): Promise<Record<string, unknown>> {
  // Queue scheduling job
  const schedulingQueue = QueueManager.getQueue(QUEUE_NAMES.SCHEDULING);
  const draftId = (config.draftId as string) || context.state.draftId;

  if (!draftId) {
    throw new Error('No draftId found for scheduling');
  }

  const scheduleInHours = config.scheduleInHours as number || 24;
  const scheduledFor = new Date(Date.now() + scheduleInHours * 60 * 60 * 1000);

  await schedulingQueue.add('schedule-post', {
    businessId: context.businessId,
    draftId,
    scheduledFor: scheduledFor.toISOString(),
  }, {
    delay: scheduleInHours * 60 * 60 * 1000,
  });

  return {
    queued: true,
    type: 'scheduling',
    scheduledFor: scheduledFor.toISOString(),
  };
}

async function executeContentPosting(
  config: Record<string, unknown>,
  context: StepContext
): Promise<Record<string, unknown>> {
  // Queue posting job
  const postingQueue = QueueManager.getQueue(QUEUE_NAMES.POSTING);
  const draftId = (config.draftId as string) || context.state.draftId;

  if (!draftId) {
    throw new Error('No draftId found for posting');
  }

  await postingQueue.add('publish-post', {
    businessId: context.businessId,
    draftId,
    platforms: config.platforms || ['LINKEDIN'],
  });

  return { queued: true, type: 'posting' };
}

async function executeNotification(
  config: Record<string, unknown>,
  context: StepContext
): Promise<Record<string, unknown>> {
  // Send notification (email, in-app, etc.)
  try {
    const emailQueue = QueueManager.getQueue(QUEUE_NAMES.EMAIL);

    if (!emailQueue) {
      console.error('[Notification] Email queue not initialized');
      return { queued: false, error: 'Email queue not available' };
    }

    const recipients = config.recipients as string[] || [];
    const to = recipients.length > 0 ? recipients[0] : context.creatorEmail;

    if (!to) {
      console.error('[Notification] No recipients found for notification');
      return { queued: false, error: 'No recipients defined' };
    }

    await emailQueue.add('send-email', {
      type: (config.type || 'workflow-notification') as any, // Use an allowed type from EmailType
      to,
      subject: replaceTemplates(config.subject as string || 'Workflow Step Completed', context.state),
      html: replaceTemplates(config.html as string || config.message as string || 'A workflow step has been completed.', context.state),
    });

    return { queued: true, type: 'notification' };
  } catch (error) {
    console.error('[Notification] Failed to queue notification:', error);
    return { queued: false, error: String(error) };
  }
}

async function executeCustom(
  config: Record<string, unknown>,
  context: StepContext
): Promise<Record<string, unknown>> {
  // Custom step execution - could be webhooks, API calls, etc.
  console.log('[Custom Step] Config:', config);
  return { executed: true, type: 'custom', config };
}

// Helper to resolve config with state
function resolveConfig(config: Record<string, any>, state: Record<string, any>): Record<string, any> {
  const resolved = { ...config };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string') {
      resolved[key] = replaceTemplates(value, state);
    }
  }
  return resolved;
}

// Simple template replacement
function replaceTemplates(text: string, state: Record<string, any>): string {
  return text.replace(/\{\{(.+?)\}\}/g, (match, key) => {
    const parts = key.trim().split('.');
    let val: any = state;
    for (const part of parts) {
      val = val?.[part];
    }
    return val !== undefined ? String(val) : match;
  });
}

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('[Worker] Workflow execution worker error:', err);
});

console.log('[Worker] Workflow execution worker initialized');
