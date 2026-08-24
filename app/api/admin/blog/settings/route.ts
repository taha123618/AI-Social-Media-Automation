import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

const DEFAULT_SETTINGS = {
  enabled: true,
  defaultModel: "google/gemini-2.0-flash-lite-001",
  fallbackModel: "openai/gpt-4o-mini",
  maxGenerationPerDay: 100,
  maxWordsPerArticle: 8000,
  defaultTone: "PROFESSIONAL",
  defaultLength: "MEDIUM",
  enableSeoAnalysis: true,
  enableAiDetectionBypass: true,
  enableAutoSave: true,
  autoSaveInterval: 30,
  moderationEnabled: true,
  maxConcurrentGenerations: 5,
};

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ settings: DEFAULT_SETTINGS });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    return NextResponse.json({ success: true, settings: { ...DEFAULT_SETTINGS, ...body } });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
