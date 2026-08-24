import { NextRequest, NextResponse } from "next/server";
import { ImageService } from "@/features/image_generation/services/image.service";
import { BrandFilterOptionsSchema } from "@/features/image_generation/types";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { imageUrl, options } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Validate options
    const validatedOptions = options ? BrandFilterOptionsSchema.parse(options) : {};

    // Apply brand filters
    const filteredImageUrl = await ImageService.applyBrandFilters(
      businessId,
      imageUrl,
      validatedOptions
    );

    return NextResponse.json({ 
      success: true, 
      data: { imageUrl: filteredImageUrl } 
    });
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
