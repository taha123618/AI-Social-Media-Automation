import { AIService } from '@/services/ai/ai.service';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID required' },
        { status: 400 }
      );
    }

    // Verify the user has access to this business
    const businessMember = await prisma.businessMember.findUnique({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId: businessId
        }
      }
    });

    if (!businessMember) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this business' },
        { status: 403 }
      );
    }

    const { action, input } = await req.json();

    if (action === 'generate-comment') {
      const { prompt, existingContent, tone } = input;
      const optimizedPrompt = `You are an expert social media manager. Generate a highly engaging, context-aware reply/comment for social media.
Tone: ${tone || 'Engaging'}
Original Content/Context: ${existingContent || 'N/A'}
User Prompt: ${prompt}

Return only the final comment text. No conversational filler.`;

      const content = await AIService.generateWithOpenRouter({
        prompt: optimizedPrompt,
        model: input.model,
        maxTokens: input.maxTokens || 300,
        temperature: input.temperature || 0.7
      });

      // Save to isolated comment history
      await prisma.commentAIHistory.create({
        data: {
          prompt: prompt || 'Quick Action',
          response: content,
          tone: tone || 'Engaging',
          userId: session.user.id,
          businessId: businessId
        }
      });

      return NextResponse.json({
        success: true,
        text: content,
      });
    }

    if (action === 'get-history') {
      const history = await prisma.commentAIHistory.findMany({
        where: {
          businessId: businessId,
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });

      return NextResponse.json({
        success: true,
        history
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Comment AI API Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
