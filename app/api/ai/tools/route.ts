import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  growthScoreTool,
  adBoosterTool,
  analyticsTool,
  blogContentTool,
  searchCompetitorsTool,
  analyzeCompetitorTool,
  crmIntegrationTool,
  industryTemplateTool,
  localEventTool,
  multiLocationTool,
  generateContentTool,
  schedulePostTool,
  getPostAnalyticsTool,
  requestReviewTool,
  generateReviewReplyTool,
  reviewToSocialPostTool,
  listEngagementTool,
  replyToCommentTool,
  weatherTool,
  youtubeTool,
  ToolDefinition,
} from '@/services/ai';
import { SystemLogger } from '@/features/system/services/logger.service';

const ALL_TOOLS: ToolDefinition<any, any>[] = [
  growthScoreTool,
  adBoosterTool,
  analyticsTool,
  blogContentTool,
  searchCompetitorsTool,
  analyzeCompetitorTool,
  crmIntegrationTool,
  industryTemplateTool,
  localEventTool,
  multiLocationTool,
  generateContentTool,
  schedulePostTool,
  getPostAnalyticsTool,
  requestReviewTool,
  generateReviewReplyTool,
  reviewToSocialPostTool,
  listEngagementTool,
  replyToCommentTool,
  weatherTool,
  youtubeTool,
];

const TOOL_REGISTRY: Record<string, ToolDefinition<any, any>> = {};
for (const tool of ALL_TOOLS) {
  if (tool && tool.id) {
    TOOL_REGISTRY[tool.id] = tool;
  }
}

/**
 * GET /api/ai/tools
 * List all available custom AI tools
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tools = Object.values(TOOL_REGISTRY).map((tool) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
    }));

    return NextResponse.json({ success: true, tools });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list tools' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/tools
 * Execute an AI tool with Zod schema validation
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
    const { tool: toolId, input } = body;

    if (!toolId || !input) {
      return NextResponse.json(
        { error: 'tool and input are required' },
        { status: 400 }
      );
    }

    const tool = TOOL_REGISTRY[toolId];
    if (!tool) {
      return NextResponse.json(
        { error: `Tool "${toolId}" not found` },
        { status: 404 }
      );
    }

    // Automatically inject businessId if not provided or mismatch
    const enrichedInput = {
      ...input,
      businessId: input.businessId || businessId,
    };

    // Validate input against tool schema
    const parsedInput = tool.inputSchema.parse(enrichedInput);

    await SystemLogger.logActivity({
      action: 'AI_TOOL_EXECUTED',
      entity: 'AITool',
      entityId: toolId,
      details: { businessId },
    });

    const result = await tool.execute(parsedInput);

    return NextResponse.json({
      success: true,
      toolId,
      result,
    });
  } catch (error: any) {
    await SystemLogger.logError({
      message: `Tool execution failed: ${error.message}`,
      source: 'POST /api/ai/tools',
    });

    return NextResponse.json(
      { success: false, error: error.message || 'Tool execution failed' },
      { status: 500 }
    );
  }
}
