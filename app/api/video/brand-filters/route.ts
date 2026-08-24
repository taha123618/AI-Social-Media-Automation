import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/features/video_generation/services/video.service";
import { BrandFilterOptionsSchema } from "@/features/video_generation/types";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoUrl, options } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    // Validate options
    const validatedOptions = options ? BrandFilterOptionsSchema.parse(options) : {};

    // Apply brand filters
    const filteredVideoUrl = await VideoService.applyBrandFilters(
      session.user.id,
      videoUrl,
      validatedOptions
    );

    return NextResponse.json({ videoUrl: filteredVideoUrl });
  } catch (error) {
    console.error("Brand filters error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to apply brand filters" },
      { status: 500 }
    );
  }
}