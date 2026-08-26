import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getActiveWorkspaceId } from "@/app/(user)/actions/workspace";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { StudioTabs } from "./_components/studio-tabs";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "AI Creative Studio | SocialAI",
  description: "Unified AI media production studio for images, video reels, and asset library management.",
};

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const businessId = (await getActiveWorkspaceId()) || "";
  let userId = "";
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    userId = session?.user?.id || "";
  } catch (error) {
    // Guest context fallback
  }

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              AI Creative Studio
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/20">
              MULTIMODAL V2
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate high-resolution social imagery, cinematic AI video reels, and manage your cloud media library.
          </p>
        </div>
      </div>

      {/* Unified Tabbed Studio Dashboard */}
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-muted-foreground font-mono">
            Loading Creative Studio...
          </div>
        }
      >
        <StudioTabs businessId={businessId} userId={userId} />
      </Suspense>
    </div>
  );
}
