import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import { WorkflowService } from '@/features/workflow/services/workflow.service';
import { z } from 'zod';

const approveSchema = z.object({
    comment: z.string().optional()
});

export const POST = apiHandler(async (req, { user }) => {
    const url = new URL(req.url);
    const draftId = url.pathname.split('/')[3];

    const body = await parseBody(req, approveSchema);
    const result = await WorkflowService.approveDraft(draftId, user.id, body.comment);
    return NextResponse.json(result);
});
