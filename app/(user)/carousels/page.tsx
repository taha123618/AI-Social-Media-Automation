import React from "react";
import { getActiveWorkspaceId } from "@/app/(user)/actions/workspace";
import prisma from "@/lib/prisma";
import { CarouselCanvas } from "@/components/carousel/CarouselCanvas";

export const dynamic = "force-dynamic";

export default async function CarouselsPage({
  searchParams,
}: {
  searchParams?: Promise<{ businessId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const businessId =
    resolvedParams?.businessId || (await getActiveWorkspaceId()) || "";

  let businessName = "Workspace";
  if (businessId) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true },
    });
    if (business?.name) {
      businessName = business.name;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <CarouselCanvas
        businessId={businessId}
        businessName={businessName}
      />
    </div>
  );
}
