import { QueueManager, QUEUE_NAMES } from '@/features/scheduler/config/queue.config';
import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { SystemLogger } from '@/features/system/services/logger.service';

export interface WorkflowExecutionJob {
  workflowId: string;
  executionId: string;
  triggerData?: Prisma.InputJsonObject;
}

export class WorkflowExecutionService {
  /**
   * Start a workflow execution
   */
  static async startExecution(workflowId: string, triggerData?: Prisma.InputJsonObject) {
    // Get workflow with steps
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    if (!workflow) throw new Error('Workflow not found');
    if (!workflow.isActive) throw new Error('Workflow is not active');
    if (workflow.steps.length === 0) throw new Error('Workflow has no steps');

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'PENDING',
        triggerData: (triggerData || {}) as Prisma.InputJsonObject,
      },
    });

    // Create step run records
    await prisma.workflowRun.createMany({
      data: workflow.steps.map((step) => ({
        workflowId,
        executionId: execution.id,
        stepId: step.id,
        status: 'PENDING',
      })),
    });

    // Queue the execution job
    const workflowExecutionQueue = QueueManager.getQueue(QUEUE_NAMES.WORKFLOW);
    await workflowExecutionQueue.add(
      'execute-workflow',
      {
        workflowId,
        executionId: execution.id,
        triggerData,
      },
      {
        jobId: execution.id,
      }
    );

    await SystemLogger.logActivity({
      action: "WORKFLOW_QUEUED",
      entity: "WorkflowExecution",
      entityId: execution.id,
      details: { workflowId, triggerType: (triggerData as any)?.type }
    });

    return execution;
  }

  /**
   * Get execution status
   */
  static async getExecutionStatus(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        runs: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return execution;
  }

  /**
   * Cancel a running execution
   */
  static async cancelExecution(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) throw new Error('Execution not found');
    if (execution.status === 'COMPLETED' || execution.status === 'FAILED') {
      throw new Error('Cannot cancel completed or failed execution');
    }

    // Remove from queue if pending
    if (execution.status === 'PENDING') {
      const workflowExecutionQueue = QueueManager.getQueue(QUEUE_NAMES.WORKFLOW);
      await workflowExecutionQueue.remove(executionId);
    }

    // Update status
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'CANCELLED' },
    });

    // Cancel pending runs
    await prisma.workflowRun.updateMany({
      where: {
        executionId,
        status: 'PENDING',
      },
      data: { status: 'SKIPPED' },
    });

    await SystemLogger.logActivity({
      action: "WORKFLOW_CANCELLED",
      entity: "WorkflowExecution",
      entityId: executionId,
      details: { workflowId: execution.workflowId }
    });

    return { success: true };
  }
}
