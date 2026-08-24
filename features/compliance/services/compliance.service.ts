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

      // In a production environment, this would:
      // 1. Delete user from DB
      // 2. Anonymize/Delete organization data if they are the sole owner
      // 3. Purge social tokens
      // 4. Trigger a notification to the user

      await prisma.user.delete({ where: { id: user.id } });

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
