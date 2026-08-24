"use server";

import { ImageService } from "@/features/image_generation/services/image.service";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function generateBlogSectionImage(
  prompt: string,
  options?: {
    referenceImage?: string;
    style?: string;
    aspectRatio?: string;
  }
): Promise<{ url: string; revisedPrompt: string }> {
  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) throw new Error("No active workspace");

  const session = await auth.api.getSession({ headers: await headers() });

  return ImageService.generateBlogSectionImage(prompt, {
    ...options,
    businessId,
    userId: session?.user?.id,
  } as any);
}
