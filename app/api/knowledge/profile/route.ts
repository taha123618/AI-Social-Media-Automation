import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseBody } from '@/lib/api-utils';
import { KnowledgeService, BusinessProfileSchema } from '@/features/knowledge/services/knowledge.service';

export const GET = apiHandler(async (req, { businessId, user }) => {
  if (!businessId) {
      return NextResponse.json({ error: "Business ID required in headers" }, { status: 400 });
  }
    const profile = await KnowledgeService.getProfile(businessId, user.id);
  return NextResponse.json(profile);
});

export const POST = apiHandler(async (req, { businessId, user }) => {
    if (!businessId) {
        return NextResponse.json({ error: "Business ID required in headers" }, { status: 400 });
    }
    const body = await parseBody(req, BusinessProfileSchema);
    const updated = await KnowledgeService.updateProfile(businessId, user.id, body);
    return NextResponse.json(updated);
});
