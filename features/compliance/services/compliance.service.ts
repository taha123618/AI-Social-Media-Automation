import prisma from "@/lib/prisma";
import { SystemLogger } from "@/features/system/services/logger.service";

export class ComplianceService {
   /**
    * Handle Meta Data Deletion Request (GDPR/Meta Requirement)
    */
   static async handeMetaDataDeletion(userEmail: string) {
      console.warn(`[COMPLIANCE] Data deletion requested for user: ${userEmail}`);

      const user = await prisma.user.findUnique({
         where: { email: userEmail },
         include: { ownedOrganizations: true },
      });

      if (!user) throw new Error("User not found");

      await prisma.$transaction(async (tx) => {
         const ownedOrgs = await tx.organization.findMany({
            where: { ownerId: user.id },
            select: { id: true },
         });

         for (const org of ownedOrgs) {
            const businesses = await tx.business.findMany({
               where: { organizationId: org.id },
               select: { id: true },
            });
            const bizIds = businesses.map((b) => b.id);

            if (bizIds.length > 0) {
               await tx.post.deleteMany({ where: { businessId: { in: bizIds } } });
               await tx.review.deleteMany({ where: { businessId: { in: bizIds } } });
               await tx.lead.deleteMany({ where: { businessId: { in: bizIds } } });
               await tx.businessMember.deleteMany({ where: { businessId: { in: bizIds } } });
               await tx.business.deleteMany({ where: { id: { in: bizIds } } });
            }

            await tx.subscription.deleteMany({ where: { organizationId: org.id } });
            await tx.organizationMember.deleteMany({ where: { organizationId: org.id } });
            await tx.organization.delete({ where: { id: org.id } });
         }

         await tx.businessMember.deleteMany({ where: { userId: user.id } });
         await tx.organizationMember.deleteMany({ where: { userId: user.id } });
         await tx.notification.deleteMany({ where: { userId: user.id } });
         await tx.activityLog.deleteMany({ where: { userId: user.id } });
         await tx.auditLog.deleteMany({ where: { userId: user.id } });
         await tx.session.deleteMany({ where: { userId: user.id } });
         await tx.account.deleteMany({ where: { userId: user.id } });
         await tx.user.delete({ where: { id: user.id } });
      });

      await SystemLogger.logAudit({
         action: "DATA_DELETION_REQUESTED",
         resource: "User",
         status: "SUCCESS",
         userId: user.id,
         details: { email: userEmail }
      });

      return { success: true, message: "Deletion process initiated" };
   }

   /**
    * GDPR Data Export
    */
   static async exportUserData(userId: string) {
      const user = await prisma.user.findUnique({
         where: { id: userId },
         include: {
            ownedOrganizations: {
               include: {
                  businesses: {
                     include: {
                        posts: true,
                        profile: true,
                     }
                  }
               }
            }
         }
      });

      await SystemLogger.logAudit({
         action: "DATA_EXPORT_REQUESTED",
         resource: "User",
         status: "SUCCESS",
         userId: userId
      });

      return JSON.stringify(user, null, 2);
   }
}
