import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    const updatedAccount = await prisma.socialAccount.update({
      where: {
        id: validatedData.id,
        businessId: businessId
      },
      data: {
        name: validatedData.name
      }
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('[Social Account Update] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
