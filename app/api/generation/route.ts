import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import { GenerationService } from '@/features/generation/services/generation.service';
import { SchedulerService } from '@/features/scheduler/services/scheduler.service';
import { z } from 'zod';
import { ContentIntent, Platform } from '@/app/generated/prisma/enums';
import prisma from '@/lib/prisma';

const generateSchema = z.object({
    intent: z.enum(Object.values(ContentIntent) as [string, ...string[]]),
    platforms: z.array(z.enum(Object.values(Platform) as [string, ...string[]])).min(1),
    topic: z.string().optional(),
    customInstructions: z.string().optional(),
    async: z.boolean().optional().default(false)
});


export const POST = apiHandler(async (req, { businessId, user }) => {
    // Handle placeholder business ID
    let targetBusinessId = businessId;
    if (!targetBusinessId || targetBusinessId === 'placeholder-id') {
        // Get active workspace for the user
        const activeWorkspace = await prisma.businessMember.findFirst({
            where: { userId: user.id },
            include: { business: true }
        });

        if (activeWorkspace) {
            targetBusinessId = activeWorkspace.businessId;
        } else {
            // Create a default business for the user
            const business = await prisma.business.create({
                data: {
                    name: `${user.email?.split('@')[0] || 'User'}'s Workspace`,
                    slug: `${user.email?.split('@')[0] || 'user'}-workspace-${Date.now().toString().slice(-4)}`,
                    members: {
                        create: {
                            userId: user.id,
                            role: 'OWNER',
                        },
                    },
                },
            });
            targetBusinessId = business.id;
        }
    }

    // Validate Body
    const body = await parseBody(req, generateSchema);
    const { intent, platforms, topic, customInstructions } = body;

    // 1. Create a "Generating" draft immediately for UX visibility
    const draft = await prisma.contentDraft.create({
        data: {
            businessId: targetBusinessId,
            creatorId: user.id,
            intent: intent as ContentIntent,
            platforms: platforms as Platform[],
            customPrompt: customInstructions,
            status: "DRAFT",
            assetStatus: "GENERATING",
            title: topic || "AI Generated Post"
        }
    });

    // 2. Queue Job for background processing
    const job = await SchedulerService.queueGenerationTask({
        businessId: targetBusinessId,
        creatorId: user.id,
        intent: intent as ContentIntent,
        platforms: platforms as Platform[],
        topic: topic || "",
        customInstructions,
        draftId: draft.id
    });

    return NextResponse.json({
        message: "Generation queued",
        jobId: job.id,
        draftId: draft.id,
        status: "ACCEPTED"
    }, { status: 202 });
});
