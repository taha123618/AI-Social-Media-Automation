import { Metadata } from "next";
import { VoiceStudio } from "@/components/voice/VoiceStudio";
import { getActiveWorkspaceId } from "@/app/(user)/actions/workspace";
import { EntitlementService } from "@/features/billing/services/entitlement.service";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Voice Cloning & Narration Studio | AI Social Automation",
  description: "Generate studio-grade audio narration and voiceovers for social videos, reels, and shorts on autopilot.",
};

export default async function VoiceStudioPage({
  searchParams,
}: {
  searchParams?: Promise<{ businessId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const businessId =
    resolvedParams?.businessId || (await getActiveWorkspaceId()) || "";

  let planId: "free" | "starter" | "pro" | "enterprise" = "free";
  if (businessId) {
    try {
      planId = await EntitlementService.resolvePlanForBusiness(businessId);
    } catch (e) {
      planId = "free";
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <VoiceStudio businessId={businessId} planId={planId} />
    </div>
  );
}
