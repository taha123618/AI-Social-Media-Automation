import "dotenv/config";
import prisma from "../../lib/prisma";

async function clearSeededLogs() {
   console.log("🗑️  Clearing seeded test data from logs...");

   // Remove any logs that were created by the seed script.
   // The seed script created logs with action "USER_LOGIN" and "SETTINGS_CHANGE"
   // and messages like "Failed to process job X". We target those patterns.

   const activityDeleted = await prisma.activityLog.deleteMany({
      where: {
         OR: [
            { action: "USER_LOGIN" },     // seeded
            { action: "ACCOUNT_CREATED" }, // seeded
         ],
      },
   });

   const errorDeleted = await prisma.errorLog.deleteMany({
      where: {
         message: { startsWith: "Failed to process job" }, // seeded pattern
      },
   });

   const auditDeleted = await prisma.auditLog.deleteMany({
      where: {
         action: "SETTINGS_CHANGE", // seeded
      },
   });

   // Delete all seeded metrics (they were bulk-inserted, identify by empty tags and old timestamp)
   const metricDeleted = await prisma.systemMetric.deleteMany({
      where: {
         timestamp: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      },
   });

   console.log(`✅ Deleted:
  - ${activityDeleted.count} activity logs
  - ${errorDeleted.count} error logs
  - ${auditDeleted.count} audit logs
  - ${metricDeleted.count} system metrics`);
}

clearSeededLogs()
   .catch(console.error)
   .finally(() => prisma.$disconnect());
