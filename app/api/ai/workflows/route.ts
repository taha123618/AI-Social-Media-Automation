import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  blogWorkflow,
  postPublishingWorkflow,
  weatherWorkflow,
  WorkflowDefinition,
} from '@/services/ai';
import { SystemLogger } from '@/features/system/services/logger.service';

const WORKFLOW_REGISTRY: Record<string, WorkflowDefinition<any, any>> = {
  [blogWorkflow.id]: blogWorkflow,
  [postPublishingWorkflow.id]: postPublishingWorkflow,
  [weatherWorkflow.id]: weatherWorkflow,
};

/**
 * GET /api/ai/workflows
 * List all available custom AI workflows
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = Object.values(WORKFLOW_REGISTRY).map((wf) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description,
    }));

    return NextResponse.json({ success: true, workflows });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/workflows
 * Execute a custom AI workflow DAG
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Verify tenant membership
    const membership = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const { workflow: workflowId, input } = body;

    if (!workflowId || !input) {
      return NextResponse.json(
        { error: 'workflow and input are required' },
        { status: 400 }
      );
    }

    const workflow = WORKFLOW_REGISTRY[workflowId];
    if (!workflow) {
      return NextResponse.json(
        { error: `Workflow "${workflowId}" not found` },
        { status: 404 }
      );
    }

    // Enrich input with tenant context
    const enrichedInput = {
      ...input,
      businessId: input.businessId || businessId,
      userId: session.user.id,
    };

    await SystemLogger.logActivity({
      action: 'AI_WORKFLOW_EXECUTED',
      entity: 'AIWorkflow',
      entityId: workflowId,
      details: { businessId },
    });

    const result = await workflow.execute(enrichedInput);

    return NextResponse.json({
      success: true,
      workflowId,
      result,
    });
  } catch (error: any) {
    await SystemLogger.logError({
      message: `Workflow execution failed: ${error.message}`,
      source: 'POST /api/ai/workflows',
    });

    return NextResponse.json(
      { success: false, error: error.message || 'Workflow execution failed' },
      { status: 500 }
    );
  }
}
