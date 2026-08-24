import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MetaBusinessManagerService } from '@/features/social/services/meta-business-manager-extended.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch posts published in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await prisma.post.findMany({
      where: {
        postedAt: { gte: thirtyDaysAgo },
        externalPostId: { not: null }
      },
      include: {
        socialAccount: true
      }
    });

    let successCount = 0;

    for (const post of posts) {
      try {
        const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(post.socialAccount);
        
        let metrics;
        if (post.platform === 'INSTAGRAM') {
           metrics = await MetaBusinessManagerService.getInstagramMediaInsights(post.externalPostId!, accessToken);
        } else if (post.platform === 'FACEBOOK') {
           metrics = await MetaBusinessManagerService.getFacebookPostInsights(post.externalPostId!, accessToken);
        }

        if (metrics) {
          await prisma.post.update({
            where: { id: post.id },
            data: {
              likes: metrics.engagement?.likes || 0,
              comments: metrics.engagement?.comments || 0,
              shares: metrics.engagement?.shares || 0,
              reach: metrics.reach?.reach || 0,
              impressions: metrics.reach?.impressions || 0,
              analyticsUpdatedAt: new Date()
            }
          });
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to sync post ${post.id}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: successCount,
      totalCount: posts.length 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
