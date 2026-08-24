import { NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import { WorkflowService } from '@/features/workflow/services/workflow.service';
import { SchedulerService } from '@/features/scheduler/services/scheduler.service';
import { Platform } from '@/app/generated/prisma/client';
import { z } from 'zod';

const scheduleSchema = z.object({
    scheduledDate: z.string().datetime()
});

export const POST = apiHandler(async (req, { user }) => {
    const url = new URL(req.url);
    const draftId = url.pathname.split('/')[3];

    const body = await parseBody(req, scheduleSchema);
    const date = new Date(body.scheduledDate);

    // 1. Update State
    const draft = await WorkflowService.scheduleDraft(draftId, user.id, date);

    // 2. Queue Jobs
    await Promise.all(draft.platforms.map(platform => {
        return SchedulerService.schedulePost({
            draftId: draft.id,
            platform: platform as Platform,
            scheduledTime: date,
            accessToken: "mock_token"
        });
    }));

    return NextResponse.json({ message: "Scheduled successfully", draft });
});
