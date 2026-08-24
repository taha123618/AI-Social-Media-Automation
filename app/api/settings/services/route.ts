import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { Platform } from '@/app/generated/prisma/client';

export async function GET(req: NextRequest) {
   try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const businessId = req.headers.get('x-business-id');
      if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

      const services = await prisma.thirdPartyService.findMany({
         where: { businessId }
      });

      return NextResponse.json(services);
   } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}

const serviceSchema = z.object({
   platform: z.nativeEnum(Platform),
   apiKey: z.string().min(1),
   apiSecret: z.string().min(1),
   apiTier: z.string().optional(),
   isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
   try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const businessId = req.headers.get('x-business-id');
      if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

      const body = await req.json();
      const validatedData = serviceSchema.parse(body);

      const service = await prisma.thirdPartyService.upsert({
         where: {
            businessId_platform: {
               businessId,
               platform: validatedData.platform,
            },
         },
         update: validatedData,
         create: {
            ...validatedData,
            businessId,
         },
      });

      return NextResponse.json(service);
   } catch (error) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
