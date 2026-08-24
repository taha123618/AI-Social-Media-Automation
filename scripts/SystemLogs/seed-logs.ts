import "dotenv/config";
import prisma from "../../lib/prisma";

async function main() {
   console.log("Seeding system logs and metrics...");

   // Seed Admin user for relation if there's any user in DB, else skip relation.
   const user = await prisma.user.findFirst();

   // Create Metrics
   const now = new Date();
   const metrics = [];
   for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      metrics.push(
         { name: "CPU_USAGE", value: Math.random() * 40 + 10, unit: "PERCENTAGE", timestamp },
         { name: "MEMORY_USAGE", value: Math.random() * 30 + 40, unit: "PERCENTAGE", timestamp },
         { name: "ACTIVE_USERS", value: Math.floor(Math.random() * 100), unit: "COUNT", timestamp }
      );
   }
   await prisma.systemMetric.createMany({ data: metrics });

   // Create Activity Logs
   await prisma.activityLog.createMany({
      data: Array.from({ length: 50 }).map((_, i) => ({
         action: i % 2 === 0 ? "USER_LOGIN" : "POST_CREATED",
         entity: i % 2 === 0 ? "User" : "Post",
         userId: user?.id,
         createdAt: new Date(now.getTime() - i * 20 * 60 * 1000),
         details: { ip: "192.168.1.1" },
      })),
   });

   // Create Error Logs
   await prisma.errorLog.createMany({
      data: Array.from({ length: 30 }).map((_, i) => ({
         message: `Failed to process job ${i}`,
         source: i % 3 === 0 ? "Frontend" : "Worker",
         resolved: i % 5 === 0,
         createdAt: new Date(now.getTime() - i * 30 * 60 * 1000),
      })),
   });

   // Create Audit Logs
   await prisma.auditLog.createMany({
      data: Array.from({ length: 20 }).map((_, i) => ({
         action: "SETTINGS_CHANGE",
         resource: "OrganizationSettings",
         userId: user?.id,
         status: i % 10 === 0 ? "FAILURE" : "SUCCESS",
         createdAt: new Date(now.getTime() - i * 40 * 60 * 1000),
      })),
   });

   console.log("Seeding complete.");
}

main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
