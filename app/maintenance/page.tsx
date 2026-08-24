import type { Metadata } from "next";
import { MaintenanceService } from "@/lib/maintenance";
import { MaintenanceContent } from "./_components/maintenance-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Under Maintenance - Social AI",
  description: "Our system is currently undergoing scheduled maintenance. We will be back online shortly.",
  robots: "noindex, nofollow", // Prevent indexing during maintenance
};

export default async function MaintenancePage() {
  const config = await MaintenanceService.getConfig();

  return (
    <MaintenanceContent
      message={config.message}
      estimatedCompletion={config.estimatedCompletion}
    />
  );
}
