import prisma from "@/lib/prisma";

export class EngagementTracker {
   /**
    * Sync metrics from a social platform (e.g., Ayrshare webhook)
    */
   static async syncMetrics(postId: string, metrics: {
      likes: number;
      shares: number;
      comments: number;
      impressions: number;
   }) {
      return await prisma.post.update({
         where: { id: postId },
         data: {
            ...metrics,
            analyticsUpdatedAt: new Date()
         },
      });
   }

   /**
    * Get feedback for the Content Generator
    * Returns top performing captions for few-shot learning.
    */
   static async getTopPerformingContent(businessId: string, limit: number = 3) {
      const topPosts = await prisma.post.findMany({
         where: {
            businessId,
            status: "POSTED"
         },
         include: {
            draft: {
               select: {
                  contentJson: true
               }
            }
         },
         orderBy: {
            likes: "desc",
         },
         take: limit,
      });

      return topPosts.map(post => ({
         caption: (post.draft?.contentJson as any)?.caption || "",
         engagementScore: (post.likes || 0) + (post.shares || 0),
      }));
   }
}
