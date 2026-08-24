import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [leads, total] = await Promise.all([
      prisma.demoLead.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: { booking: true, assignedAdmin: { select: { id: true, name: true, email: true } } },
      }),
      prisma.demoLead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lead = await prisma.demoLead.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        company: body.company,
        phone: body.phone || "",
        country: body.country || "",
        teamSize: body.teamSize || "",
        jobTitle: body.jobTitle || "",
        useCase: body.useCase || "",
        preferredDate: body.preferredDate || "",
        preferredTime: body.preferredTime || "",
        notes: body.notes || null,
        status: body.status || "NEW",
        source: body.source || "DIRECT_LINK",
        assignedTo: body.assignedTo || null,
      },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
