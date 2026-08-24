import { NextResponse } from 'next/server';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import prisma from '@/lib/prisma';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import { Platform } from '@/app/generated/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const businessId = searchParams.get('businessId') || await getActiveWorkspaceIdSafe().catch(() => undefined);

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const account = await prisma.socialAccount.findFirst({
      where: {
        businessId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'No active Instagram account found' }, { status: 404 });
    }

    const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);
    const comments = await MetaBusinessManagerService.getComments(postId, accessToken);

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Instagram Comments GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments', details: String(error) }, { status: 500 });
  }
}
