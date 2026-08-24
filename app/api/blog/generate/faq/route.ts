import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BlogGeneratorService } from "@/features/ai-blog/services/blog-generator.service";
import { GenerateFAQSchema } from "@/features/ai-blog/types/blog.types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = GenerateFAQSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.format() }, { status: 400 });
    }

    const faqs = await BlogGeneratorService.generateFAQs(
      result.data.topic,
      result.data.content,
      result.data.targetKeywords,
      result.data.count
    );

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("[API/BLOG/GENERATE/FAQ] FAQ generation failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
