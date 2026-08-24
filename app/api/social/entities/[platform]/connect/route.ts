import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Platform } from '@/app/generated/prisma/client';

export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ platform: string }> }
) {
   const { platform } = await params;
   try {
      const { stateId, entityId, entityName, entityAvatar, entityAccessToken } = await req.json();

      const state = await prisma.oAuthState.findUnique({
         where: { id: stateId }
      });

      if (!state) {
         return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
      }

      const platformEnum = platform.toUpperCase() as Platform;

      await prisma.socialAccount.upsert({
         where: {
            businessId_platform_platformId: {
               businessId: state.businessId,
               platform: platformEnum,
               platformId: entityId
            }
         },
         update: {
            accessToken: entityAccessToken,
            name: entityName,
            avatar: entityAvatar,
            profileUrl: platformEnum === 'FACEBOOK' ? `https://www.facebook.com/${entityId}` : `https://www.instagram.com/${entityName}`,
            isActive: true
         },
         create: {
            businessId: state.businessId,
            platform: platformEnum,
            platformId: entityId,
            accessToken: entityAccessToken,
            name: entityName,
            avatar: entityAvatar,
            profileUrl: platformEnum === 'FACEBOOK' ? `https://www.facebook.com/${entityId}` : `https://www.instagram.com/${entityName}`,
            isActive: true
         }
      });

      // Cleanup state
      await prisma.oAuthState.delete({ where: { id: stateId } }).catch(() => { });

      return NextResponse.json({ success: true });
   } catch (error) {
      console.error('Connect entity error:', error);
      return NextResponse.json({ error: 'Failed to connect entity' }, { status: 500 });
   }
}
