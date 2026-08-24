import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-utils';
import { WorkflowService } from '@/features/workflow/services/workflow.service';

export const POST = apiHandler(async (req, { user }) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const draftId = pathParts[3];

    if (!draftId) {
        return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    const result = await WorkflowService.submitForReview(draftId, user.id);
    return NextResponse.json(result);
});
