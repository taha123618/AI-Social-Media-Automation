import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import { WorkflowService } from '@/features/workflow/services/workflow.service';
import { z } from 'zod';

const rejectSchema = z.object({
    reason: z.string()
});

export const POST = apiHandler(async (req, { user }) => {
    const url = new URL(req.url);
    const draftId = url.pathname.split('/')[3];

    const body = await parseBody(req, rejectSchema);
    const result = await WorkflowService.rejectDraft(draftId, user.id, body.reason);
    return NextResponse.json(result);
});
