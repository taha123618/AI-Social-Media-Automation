import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import { KnowledgeService } from '@/features/knowledge/services/knowledge.service';
import { z } from 'zod';
import { SystemLogger } from '@/features/system/services/logger.service';

const registerDocSchema = z.object({
    name: z.string(),
    type: z.string(),
    key: z.string(),
    url: z.string().url()
});

export const POST = apiHandler(async (req, { businessId, user }) => {
    if (!businessId) {
        return NextResponse.json({ error: "Business ID required in headers" }, { status: 400 });
    }
    const body = await parseBody(req, registerDocSchema);
    const doc = await KnowledgeService.registerDocument(businessId, body);

    await SystemLogger.logActivity({
        action: 'KNOWLEDGE_DOCUMENT_ADDED',
        entity: 'KnowledgeDocument',
        userId: user?.id,
        details: { businessId, name: body.name, type: body.type },
    });

    return NextResponse.json(doc, { status: 201 });
});
