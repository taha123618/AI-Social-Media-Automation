import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  analyticsAgent,
  blogWriterAgent,
  blogSeoAgent,
  competitorAgent,
  engagementAgent,
  multiLocationAgent,
  postCreationAgent,
  reviewBoosterAgent,
  templateAgent,
  trendEventAgent,
  weatherAgent,
  youtubeAgent,
  AgentDefinition,
} from '@/services/ai';
import { SystemLogger } from '@/features/system/services/logger.service';

const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  analyticsAgent,
  blogWriterAgent,
  blogSeoAgent,
  competitorAgent,
  engagementAgent,
  multiLocationAgent,
  postCreationAgent,
  reviewBoosterAgent,
  templateAgent,
  trendEventAgent,
  weatherAgent,
  youtubeAgent,
};

/**
 * GET /api/ai/agents
 * List all available custom AI agents and their capabilities
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = Object.entries(AGENT_REGISTRY).map(([id, agent]) => ({
      id,
      name: agent.name,
      instructions: agent.instructions,
      model: agent.model,
      tools: Object.keys(agent.tools || {}),
    }));

    return NextResponse.json({ success: true, agents });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list agents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/agents
 * Execute an agent prompt with context
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
    const { agent: agentId, prompt, context } = body;

    if (!agentId || !prompt) {
      return NextResponse.json(
        { error: 'agent and prompt are required' },
        { status: 400 }
      );
    }

    const agent = AGENT_REGISTRY[agentId];
    if (!agent) {
      return NextResponse.json(
        { error: `Agent "${agentId}" not found` },
        { status: 404 }
      );
    }

    await SystemLogger.logActivity({
      action: 'AI_AGENT_INVOKED',
      entity: 'AIAgent',
      entityId: agentId,
      details: { businessId, promptLength: prompt.length },
    });

    const response = await agent.generateResponse?.(prompt, {
      businessId,
      userId: session.user.id,
      ...(context || {}),
    });

    return NextResponse.json({
      success: true,
      agent: agent.name,
      response,
    });
  } catch (error: any) {
    await SystemLogger.logError({
      message: `Agent execution failed: ${error.message}`,
      source: 'POST /api/ai/agents',
    });

    return NextResponse.json(
      { success: false, error: error.message || 'Agent execution failed' },
      { status: 500 }
    );
  }
}
