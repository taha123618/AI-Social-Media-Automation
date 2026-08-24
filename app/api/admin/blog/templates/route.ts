import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.blogTemplate.findMany({
    where: { isGlobal: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const template = await prisma.blogTemplate.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        category: body.category ?? null,
        structure: {},
        isGlobal: true,
      },
    });
    return NextResponse.json({ success: true, template });
  } catch (err) {
    console.error("[API/ADMIN/BLOG/TEMPLATES] Create error:", err);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Template ID required" }, { status: 400 });

  await prisma.blogTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
