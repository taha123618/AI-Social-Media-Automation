-- AlterEnum
ALTER TYPE "EntityType" ADD VALUE 'PLATFORM_CREDENTIAL';
ALTER TYPE "EntityType" ADD VALUE 'AD_ACCOUNT';
ALTER TYPE "EntityType" ADD VALUE 'CAMPAIGN';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "businessId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_businessId_idx" ON "Notification"("businessId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
